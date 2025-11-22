import { Router } from 'express';
import { createOperation, listOperations, getOperation, updateOperationStatus, listMoves, updateOperationDraft, operationMetrics } from '../controllers/operationController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Operations
router.post('/', protect, requirePermission('operations'), createOperation);
router.get('/', protect, requirePermission('operations'), listOperations);
router.get('/metrics', protect, requirePermission('operations'), operationMetrics);
router.get('/:id', protect, requirePermission('operations'), getOperation);
router.patch('/:id/status', protect, requirePermission('operations'), updateOperationStatus);
router.patch('/:id', protect, requirePermission('operations'), updateOperationDraft);

// Moves (history)
router.get('/moves/history', protect, requirePermission('audit_log'), listMoves);

export default router;