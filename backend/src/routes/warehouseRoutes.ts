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
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

// Warehouse Routes
router.post('/', createWarehouse);
router.get('/', getWarehouses);
router.get('/:id', getWarehouse);
router.put('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);

// Location Routes (Nested under warehouse or separate? I'll make them separate endpoints for now)
// Ideally: POST /warehouses/:id/locations
// But for simplicity: POST /locations (with warehouseId in body)
router.post('/locations', createLocation);
router.get('/locations', getLocations);
router.delete('/locations/:id', deleteLocation);

export default router;
