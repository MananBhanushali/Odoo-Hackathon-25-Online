import { Router } from 'express';
import { getUsers, createUser, deleteUser, updatePermissions } from '../controllers/userController.js';
import { authenticate, requireAdmin, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', requirePermission('user_mgmt'), getUsers);
router.post('/', requirePermission('user_mgmt'), createUser);
router.delete('/:id', requirePermission('user_mgmt'), deleteUser);
router.patch('/:id/permissions', requirePermission('user_mgmt'), updatePermissions);

export default router;
