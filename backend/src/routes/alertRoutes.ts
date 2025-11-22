import { Router } from 'express';
import { listAlerts, resolveAlert } from '../controllers/alertController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/', requirePermission('inventory'), listAlerts);
router.patch('/:id/resolve', requirePermission('inventory'), resolveAlert);

export default router;
