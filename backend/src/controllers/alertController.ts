import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

type PrismaWithAlert = typeof prisma & { alert: any };
const db = prisma as PrismaWithAlert;

// List alerts (optionally unresolved only)
export const listAlerts = async (req: Request, res: Response) => {
  try {
    const { unresolved } = req.query;
    const where: any = {};
    if (unresolved === 'true') where.resolved = false;
    const alerts = await db.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { product: true }
    });
    return res.json(alerts.map(formatAlert));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to fetch alerts' });
  }
};

// Resolve an alert
export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alert = await db.alert.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date() },
      include: { product: true }
    });
    return res.json(formatAlert(alert));
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to resolve alert' });
  }
};

function formatAlert(a: any) {
  return {
    id: a.id,
    productId: a.productId,
    product: a.product ? `[${a.product.sku}] ${a.product.name}` : 'Unknown',
    quantity: a.quantity,
    threshold: a.threshold,
    resolved: a.resolved,
    createdAt: a.createdAt.toISOString(),
    resolvedAt: a.resolvedAt ? a.resolvedAt.toISOString() : null
  };
}
