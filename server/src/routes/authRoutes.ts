import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updateMeasurements,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.put('/measurements', protect, updateMeasurements);

export default router;
