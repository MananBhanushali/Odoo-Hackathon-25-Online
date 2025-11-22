import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2),
  loginId: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional(),
});

const updatePermissionsSchema = z.object({
  dashboard: z.boolean(),
  inventory: z.boolean(),
  operations: z.boolean(),
  audit_log: z.boolean(),
  settings: z.boolean(),
  user_mgmt: z.boolean(),
});

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { permissions: true },
      orderBy: { createdAt: 'desc' },
    });
    // Map to frontend format if needed, but the structure is close enough
    // Frontend expects 'permissions' object which we have.
    // Frontend expects 'avatar' which we have (nullable).
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, loginId, email, password, role } = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { loginId }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or login ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        loginId,
        email,
        password: hashedPassword,
        role: role || 'User',
        permissions: {
          create: {
            dashboard: true,
            inventory: true,
            operations: true,
          },
        },
      },
      include: { permissions: true },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid user id' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
};

export const updatePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid user id' });
    }

    const permissions = updatePermissionsSchema.parse(req.body);

    const updatedPermissions = await prisma.permissions.update({
      where: { userId: id },
      data: permissions,
    });

    res.json(updatedPermissions);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update permissions' });
  }
};
