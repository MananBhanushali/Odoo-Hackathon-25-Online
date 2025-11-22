import { Router } from 'express';
import { getUsers, createUser, deleteUser, updatePermissions } from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);
router.patch('/:id/permissions', updatePermissions);

export default router;
