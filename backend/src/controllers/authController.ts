import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2),
  loginId: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  loginId: z.string(),
  password: z.string(),
});

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, loginId, email, password } = signupSchema.parse(req.body);

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
        permissions: {
          create: {
            dashboard: true, // Default permissions
            inventory: true,
            operations: true,
          },
        },
      },
      include: { permissions: true },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Signup failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { loginId, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { loginId },
      include: { permissions: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
};
