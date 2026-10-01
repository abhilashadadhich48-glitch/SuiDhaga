import { Router } from 'express';
import { Category } from '../models/Category';

const router = Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ message: 'Server error, failed to fetch categories.' });
  }
});

export default router;
