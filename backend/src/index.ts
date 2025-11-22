import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';
import operationRoutes from './routes/operationRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import prisma from './utils/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/', (req, res) => {
  res.send('Inventory Management System API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Low stock alert scheduler: run every 2 minutes
  const intervalMs = 2 * 60 * 1000;
  setInterval(async () => {
    try {
      const products = await prisma.product.findMany();
      for (const p of products) {
        if (p.quantity <= p.minThreshold) {
          const existing = await prisma.alert.findFirst({ where: { productId: p.id, resolved: false } });
          if (!existing) {
            await prisma.alert.create({ data: { productId: p.id, quantity: p.quantity, threshold: p.minThreshold } });
            console.log(`[ALERT] Low stock created for ${p.sku} qty=${p.quantity} threshold=${p.minThreshold}`);
          }
        }
      }
    } catch (e) {
      console.error('Alert scheduler error', e);
    }
  }, intervalMs);
});
