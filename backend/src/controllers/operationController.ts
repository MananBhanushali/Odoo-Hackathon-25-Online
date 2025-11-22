import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

// Temporary augmentation to access newly added delegates before TS picks up generated types
// Once IDE recognizes the updated Prisma Client, this can be removed.
type PrismaWithNewModels = typeof prisma & {
  operation: any;
  move: any;
  operationItem: any;
};
const db = prisma as PrismaWithNewModels;

// Helper: generate reference like WH/IN/0001 or WH/OUT/0005
async function generateReference(type: 'RECEIPT' | 'DELIVERY', locationId: string | null) {
  // Derive warehouse shortCode from location (required for sequence grouping)
  let warehouseShort = 'WH';
  if (locationId) {
    const loc = await prisma.location.findUnique({ where: { id: locationId }, include: { warehouse: true } });
    if (loc?.warehouse?.shortCode) warehouseShort = loc.warehouse.shortCode;
  }
  const isIn = type === 'RECEIPT';
  const code = isIn ? 'IN' : 'OUT';
  // Count existing operations for this warehouse and direction
  const count = await db.operation.count({
    where: {
      type: isIn ? 'RECEIPT' : 'DELIVERY',
      OR: [
        { toLocation: { warehouse: { shortCode: warehouseShort } } },
        { fromLocation: { warehouse: { shortCode: warehouseShort } } }
      ]
    }
  });
  const sequence = String(count + 1).padStart(4, '0');
  return `${warehouseShort}/${code}/${sequence}`;
}

export const createOperation = async (req: Request, res: Response) => {
  try {
    const { type, scheduleDate, contact, locationId, items } = req.body;
    if (!type || !scheduleDate) {
      return res.status(400).json({ message: 'type and scheduleDate are required' });
    }
    if (!['RECEIPT', 'DELIVERY'].includes(type)) {
      return res.status(400).json({ message: 'Only RECEIPT and DELIVERY supported currently' });
    }
    if (!locationId) {
      return res.status(400).json({ message: 'locationId is required for receipts/deliveries' });
    }
    // Validate location
    const location = await prisma.location.findUnique({ where: { id: locationId }, include: { warehouse: true } });
    if (!location) return res.status(404).json({ message: 'Location not found' });

    // Validate products if items provided
    const productIds = (items || []).map((i: any) => i.productId);
    if (productIds.length) {
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
      if (products.length !== productIds.length) {
        return res.status(400).json({ message: 'One or more products not found' });
      }
    }

    const reference = await generateReference(type, locationId);

    // For deliveries, check stock availability to set initial status
    let initialStatus = 'DRAFT';
    if (type === 'DELIVERY' && items && items.length) {
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
      const hasInsufficientStock = items.some((item: any) => {
        const product = products.find(p => p.id === item.productId);
        return product && product.quantity < Number(item.quantity);
      });
      initialStatus = hasInsufficientStock ? 'WAITING' : 'READY';
    }

    // Map location: receipt => toLocation, delivery => fromLocation
    const op = await db.operation.create({
      data: {
        reference,
        type,
        status: initialStatus,
        contact: contact || null,
        scheduleDate: new Date(scheduleDate),
        ...(type === 'RECEIPT' ? { toLocationId: locationId } : { fromLocationId: locationId }),
        items: items && items.length ? {
          create: items.map((i: any) => ({ productId: i.productId, quantity: Number(i.quantity) || 0 }))
        } : undefined
      },
      include: { items: true, fromLocation: true, toLocation: true }
    });

    return res.status(201).json(formatOperation(op));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create operation' });
  }
};

export const listOperations = async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    const ops = await db.operation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true, fromLocation: true, toLocation: true }
    });
    return res.json(ops.map(formatOperation));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch operations' });
  }
};

export const getOperation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const op = await db.operation.findUnique({
      where: { id },
      include: { items: true, fromLocation: true, toLocation: true }
    });
    if (!op) return res.status(404).json({ message: 'Operation not found' });
    return res.json(formatOperation(op));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch operation' });
  }
};

export const updateOperationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // EXPECTED: DONE | CANCELLED | READY | WAITING
    if (!status) return res.status(400).json({ message: 'status is required' });
    const op = await db.operation.findUnique({ where: { id }, include: { items: true } });
    if (!op) return res.status(404).json({ message: 'Operation not found' });

    // When closing operation (DONE) adjust stock & create moves in a transaction
    if (status === 'DONE') {
      if (op.status === 'DONE' || op.status === 'CANCELLED') {
        return res.status(400).json({ message: 'Operation already finalized' });
      }
      const updated = await prisma.$transaction(async (tx) => {
        // Fetch full op with locations
        const full = await (tx as any).operation.findUnique({
          where: { id },
          include: { items: true, fromLocation: true, toLocation: true }
        });
        if (!full) throw new Error('Operation missing during transaction');

        for (const item of full.items) {
          if (full.type === 'RECEIPT') {
            await tx.product.update({
              where: { id: item.productId },
              data: { quantity: { increment: item.quantity } }
            });
          } else if (full.type === 'DELIVERY') {
            const prod = await tx.product.findUnique({ where: { id: item.productId } });
            if (!prod) throw new Error('Product missing');
            const decrement = Math.min(prod.quantity, item.quantity);
            await tx.product.update({
              where: { id: item.productId },
              data: { quantity: { decrement } }
            });
          }
          // Create move record
          await (tx as any).move.create({
            data: {
              operationId: full.id,
              productId: item.productId,
              quantity: item.quantity,
              direction: full.type === 'RECEIPT' ? 'IN' : 'OUT',
              fromLocationId: full.fromLocationId || null,
              toLocationId: full.toLocationId || null,
              contact: full.contact || null,
              status: 'DONE'
            }
          });
        }

        return (tx as any).operation.update({ where: { id: full.id }, data: { status: 'DONE' } });
      });
      const final = await db.operation.findUnique({ where: { id: updated.id }, include: { items: true, fromLocation: true, toLocation: true } });
      return res.json(formatOperation(final!));
    } else {
      const updated = await db.operation.update({ where: { id }, data: { status } });
      const full = await db.operation.findUnique({ where: { id: updated.id }, include: { items: true, fromLocation: true, toLocation: true } });
      return res.json(formatOperation(full!));
    }
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update operation status' });
  }
};

export const listMoves = async (req: Request, res: Response) => {
  try {
    const { direction, productId } = req.query;
    const where: any = {};
    if (direction) where.direction = direction;
    if (productId) where.productId = productId;
    const moves = await db.move.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { product: true, operation: true, fromLocation: true, toLocation: true }
    });
    return res.json(moves.map(formatMove));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch moves' });
  }
};

// Metrics endpoint: detailed status counts for receipts and deliveries
export const operationMetrics = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const startWindow = new Date();
    startWindow.setDate(now.getDate() - 6); // last 7 days inclusive

    const [receiptDrafts, receiptDone, deliveryWaiting, deliveryReady, deliveryDone, recentMoves] = await Promise.all([
      db.operation.count({ where: { type: 'RECEIPT', status: 'DRAFT' } }),
      db.operation.count({ where: { type: 'RECEIPT', status: 'DONE' } }),
      db.operation.count({ where: { type: 'DELIVERY', status: 'WAITING' } }),
      db.operation.count({ where: { type: 'DELIVERY', status: 'READY' } }),
      db.operation.count({ where: { type: 'DELIVERY', status: 'DONE' } }),
      db.move.findMany({ where: { createdAt: { gte: startWindow } }, select: { createdAt: true, direction: true } })
    ]);

    // Aggregate by day
    const receiptsByDay: { [k: string]: number } = {};
    const deliveriesByDay: { [k: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(startWindow);
      d.setDate(startWindow.getDate() + i);
      const key = d.toISOString().split('T')[0] as string;
      receiptsByDay[key] = 0;
      deliveriesByDay[key] = 0;
    }
    for (const m of recentMoves as { createdAt: Date; direction: 'IN' | 'OUT' | 'INTERNAL' }[]) {
      if (!m.createdAt) continue;
      const key = m.createdAt.toISOString().split('T')[0] as string;
      if (Object.prototype.hasOwnProperty.call(receiptsByDay, key)) {
        if (m.direction === 'IN') receiptsByDay[key] = (receiptsByDay[key] || 0) + 1;
        if (m.direction === 'OUT') deliveriesByDay[key] = (deliveriesByDay[key] || 0) + 1;
      }
    }
    const flow = Object.keys(receiptsByDay).map(k => ({ date: k, receipts: receiptsByDay[k], deliveries: deliveriesByDay[k] }));
    return res.json({ 
      receipts: { pending: receiptDrafts, received: receiptDone },
      deliveries: { waiting: deliveryWaiting, ready: deliveryReady, delivered: deliveryDone },
      flow 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to compute metrics' });
  }
};

// Formatting helpers to align with existing frontend Operation/Move shapes
function formatOperation(op: any) {
  if (!op) return null;
  return {
    id: op.id,
    reference: op.reference,
    type: op.type === 'RECEIPT' ? 'Receipt' : op.type === 'DELIVERY' ? 'Delivery' : op.type,
    source: op.fromLocation ? op.fromLocation.shortCode : (op.type === 'RECEIPT' ? 'Vendor' : 'WH/Stock'),
    destination: op.toLocation ? op.toLocation.shortCode : (op.type === 'DELIVERY' ? 'Customer' : 'WH/Stock'),
    contact: op.contact || '',
    status: op.status.charAt(0) + op.status.slice(1).toLowerCase(),
    scheduleDate: op.scheduleDate.toISOString().split('T')[0],
    items: op.items.map((i: any) => ({ productId: i.productId, quantity: i.quantity, done: i.done }))
  };
}

export const updateOperationDraft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { contact, items } = req.body; // items full replacement array [{productId, quantity}]
    const op = await db.operation.findUnique({ where: { id }, include: { items: true } });
    if (!op) return res.status(404).json({ message: 'Operation not found' });
    if (['DONE', 'CANCELLED'].includes(op.status)) {
      return res.status(400).json({ message: 'Cannot modify finalized operation' });
    }
    // Validate products
    if (items && Array.isArray(items)) {
      const productIds = items.map((i: any) => i.productId);
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
      if (products.length !== productIds.length) {
        return res.status(400).json({ message: 'One or more products not found' });
      }
    }
    const updated = await prisma.$transaction(async (tx) => {
      // Replace items if provided
      if (items && Array.isArray(items)) {
        await (tx as any).operationItem.deleteMany({ where: { operationId: id } });
        for (const it of items) {
          await (tx as any).operationItem.create({ data: { operationId: id, productId: it.productId, quantity: Number(it.quantity) || 0 } });
        }
      }
      return (tx as any).operation.update({ where: { id }, data: { contact: contact ?? op.contact } });
    });
    const full = await db.operation.findUnique({ where: { id: updated.id }, include: { items: true, fromLocation: true, toLocation: true } });
    return res.json(formatOperation(full));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update operation' });
  }
};

function formatMove(m: any) {
  return {
    id: m.id,
    reference: m.operation?.reference || 'N/A',
    date: m.createdAt.toISOString(),
    product: `[${m.product.sku}] ${m.product.name}`,
    from: m.fromLocation ? m.fromLocation.shortCode : (m.direction === 'IN' ? 'Vendor' : 'WH/Stock'),
    to: m.toLocation ? m.toLocation.shortCode : (m.direction === 'OUT' ? 'Customer' : 'WH/Stock'),
    quantity: m.quantity,
    status: m.status === 'DONE' ? 'Done' : 'Cancelled',
    contact: m.contact || '',
    type: m.direction === 'IN' ? 'in' : m.direction === 'OUT' ? 'out' : 'internal'
  };
}
