import express from 'express';
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// All product routes should be protected
router.use(protect);

router.post('/', requirePermission('inventory'), createProduct);
router.get('/', requirePermission('inventory'), getProducts);
router.get('/:id', requirePermission('inventory'), getProduct);
router.put('/:id', requirePermission('inventory'), updateProduct);
router.delete('/:id', requirePermission('inventory'), deleteProduct);

export default router;
