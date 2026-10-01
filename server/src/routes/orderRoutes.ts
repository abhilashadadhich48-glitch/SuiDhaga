import { Router } from 'express';
import {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  createOrderReview,
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect);

router.post('/', authorize('customer'), upload.array('designReferences', 5), placeOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('tailor'), upload.single('milestonePhoto'), updateOrderStatus);
router.post('/:id/review', authorize('customer'), createOrderReview);

export default router;
