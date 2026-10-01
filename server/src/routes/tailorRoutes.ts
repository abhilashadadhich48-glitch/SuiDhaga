import { Router } from 'express';
import {
  getTailors,
  getTailorDetails,
  getMyServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/tailorController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getTailors);
router.get('/:id', getTailorDetails);

// Protected Tailor routes
router.get('/my/services', protect, authorize('tailor'), getMyServices);
router.post('/my/services', protect, authorize('tailor'), createService);
router.put('/my/services/:id', protect, authorize('tailor'), updateService);
router.delete('/my/services/:id', protect, authorize('tailor'), deleteService);

export default router;
