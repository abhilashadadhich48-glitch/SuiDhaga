import { Router } from 'express';
import {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', authorize('customer'), bookAppointment);
router.get('/', getAppointments);
router.put('/:id/status', authorize('tailor'), updateAppointmentStatus);

export default router;
