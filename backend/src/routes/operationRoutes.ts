import { Router } from 'express';
import { createOperation, listOperations, getOperation, updateOperationStatus, listMoves, updateOperationDraft, operationMetrics, refreshDeliveryStatuses } from '../controllers/operationController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Operations
router.post('/', protect, requirePermission('operations'), createOperation);
router.get('/', protect, requirePermission('operations'), listOperations);
router.get('/metrics', protect, requirePermission('operations'), operationMetrics);
router.post('/refresh-statuses', protect, requirePermission('operations'), refreshDeliveryStatuses);
router.get('/:id', protect, requirePermission('operations'), getOperation);
router.patch('/:id/status', protect, requirePermission('operations'), updateOperationStatus);
router.patch('/:id', protect, requirePermission('operations'), updateOperationDraft);

// Moves (history)
router.get('/moves/history', protect, requirePermission('audit_log'), listMoves);

export default router;