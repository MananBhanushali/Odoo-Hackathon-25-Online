import express from 'express';
import { 
  createWarehouse, 
  getWarehouses, 
  getWarehouse, 
  updateWarehouse, 
  deleteWarehouse,
  createLocation,
  getLocations,
  deleteLocation
} from '../controllers/warehouseController';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Warehouse Routes
router.post('/', requirePermission('inventory'), createWarehouse);
router.get('/', requirePermission('inventory'), getWarehouses);
router.get('/:id', requirePermission('inventory'), getWarehouse);
router.put('/:id', requirePermission('inventory'), updateWarehouse);
router.delete('/:id', requirePermission('inventory'), deleteWarehouse);

// Location Routes (Nested under warehouse or separate? I'll make them separate endpoints for now)
// Ideally: POST /warehouses/:id/locations
// But for simplicity: POST /locations (with warehouseId in body)
router.post('/locations', requirePermission('inventory'), createLocation);
router.get('/locations', requirePermission('inventory'), getLocations);
router.delete('/locations/:id', requirePermission('inventory'), deleteLocation);

export default router;
