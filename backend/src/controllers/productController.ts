import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

// Helpers
const safeInt = (val: any, fallback = 0) => {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? fallback : n;
};
const safeFloat = (val: any, fallback = 0) => {
  const n = parseFloat(val);
  return Number.isNaN(n) ? fallback : n;
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, quantity, category, minThreshold, locationId, price } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ message: 'Name and SKU are required' });
    }

    const existingProduct = await prisma.product.findUnique({ where: { sku } });
    if (existingProduct) {
      return res.status(409).json({ message: 'Product with this SKU already exists' });
    }

    if (locationId) {
      const loc = await prisma.location.findFirst({ where: { id: locationId } });
      if (!loc) return res.status(400).json({ message: 'Invalid locationId' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        quantity: safeInt(quantity, 0),
        category: category || null,
        minThreshold: safeInt(minThreshold, 0),
        locationId: locationId || null,
        price: safeFloat(price, 0),
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        location: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Product id is required' });
    const product = await prisma.product.findFirst({
      where: { id },
      include: { location: true },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Product id is required' });
    const { name, sku, quantity, category, minThreshold, locationId, price } = req.body;

    const existing = await prisma.product.findFirst({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    if (sku && sku !== existing.sku) {
      const skuConflict = await prisma.product.findUnique({ where: { sku } });
      if (skuConflict) return res.status(409).json({ message: 'Product with this SKU already exists' });
    }

    if (locationId) {
      const loc = await prisma.location.findFirst({ where: { id: locationId } });
      if (!loc) return res.status(400).json({ message: 'Invalid locationId' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        sku: sku ?? existing.sku,
        quantity: quantity !== undefined ? safeInt(quantity, existing.quantity) : existing.quantity,
        category: category !== undefined ? (category || null) : existing.category,
        minThreshold: minThreshold !== undefined ? safeInt(minThreshold, existing.minThreshold) : existing.minThreshold,
        locationId: locationId !== undefined ? (locationId || null) : existing.locationId,
        price: price !== undefined ? safeFloat(price, existing.price) : existing.price,
      },
      include: { location: true },
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Product id is required' });
    const existing = await prisma.product.findFirst({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};
