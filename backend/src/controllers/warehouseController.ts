import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

// Warehouse Controllers
export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, shortCode, address } = req.body;
    if (!name || !shortCode) return res.status(400).json({ message: 'Name and shortCode are required' });
    const existingWarehouse = await prisma.warehouse.findUnique({ where: { shortCode } });
    if (existingWarehouse) return res.status(409).json({ message: 'Warehouse with this short code already exists' });
    const warehouse = await prisma.warehouse.create({ data: { name, shortCode, address: address || null } });
    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Error creating warehouse', error);
    res.status(500).json({ message: 'Error creating warehouse' });
  }
};

export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        locations: true,
      },
    });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouses', error });
  }
};

export const getWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Warehouse id is required' });
    const warehouse = await prisma.warehouse.findFirst({ where: { id }, include: { locations: true } });
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
    res.json(warehouse);
  } catch (error) {
    console.error('Error fetching warehouse', error);
    res.status(500).json({ message: 'Error fetching warehouse' });
  }
};

export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Warehouse id is required' });
    const { name, shortCode, address } = req.body;

    const existing = await prisma.warehouse.findFirst({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Warehouse not found' });

    if (shortCode && shortCode !== existing.shortCode) {
      const conflict = await prisma.warehouse.findUnique({ where: { shortCode } });
      if (conflict) return res.status(409).json({ message: 'Warehouse with this short code already exists' });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        shortCode: shortCode ?? existing.shortCode,
        address: address !== undefined ? (address || null) : existing.address,
      },
      include: { locations: true },
    });
    res.json(warehouse);
  } catch (error) {
    console.error('Error updating warehouse', error);
    res.status(500).json({ message: 'Error updating warehouse' });
  }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Warehouse id is required' });
    const existing = await prisma.warehouse.findFirst({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Warehouse not found' });
    await prisma.warehouse.delete({ where: { id } });
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Error deleting warehouse', error);
    res.status(500).json({ message: 'Error deleting warehouse' });
  }
};

// Location Controllers (can be moved to separate file if it grows)
export const createLocation = async (req: Request, res: Response) => {
  try {
    const { name, shortCode, warehouseId } = req.body;
    if (!name || !shortCode || !warehouseId) return res.status(400).json({ message: 'name, shortCode & warehouseId are required' });
    const parent = await prisma.warehouse.findFirst({ where: { id: warehouseId } });
    if (!parent) return res.status(400).json({ message: 'Invalid warehouseId' });
    const existingLocation = await prisma.location.findUnique({ where: { shortCode } });
    if (existingLocation) return res.status(409).json({ message: 'Location with this short code already exists' });
    const location = await prisma.location.create({ data: { name, shortCode, warehouseId } });
    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location', error);
    res.status(500).json({ message: 'Error creating location' });
  }
};

export const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        warehouse: true,
      },
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Location id is required' });
    const existing = await prisma.location.findFirst({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Location not found' });
    await prisma.location.delete({ where: { id } });
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location', error);
    res.status(500).json({ message: 'Error deleting location' });
  }
};
