import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  toggleUserBlock,
  toggleTailorVerify,
  createCategory,
  deleteCategory,
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.put('/users/:id/block', toggleUserBlock);
router.put('/tailors/:id/verify', toggleTailorVerify);
router.post('/categories', upload.single('categoryImage'), createCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
