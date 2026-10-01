import { Request, Response } from 'express';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { Category } from '../models/Category';
import { Review } from '../models/Review';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all tailors (with optional filters)
// @route   GET /api/tailors
// @access  Public
export const getTailors = async (req: Request, res: Response) => {
  try {
    const { city, category, search, minRating } = req.query;

    let query: any = { role: 'tailor', isBlocked: false };

    // 1. Filter by city (case-insensitive search)
    if (city) {
      query.city = { $regex: new RegExp(city as string, 'i') };
    }

    // 2. Filter by search query (name or bio)
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search as string, 'i') } },
        { bio: { $regex: new RegExp(search as string, 'i') } },
      ];
    }

    // 3. Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating as string) };
    }

    // 4. Filter by category slug
    if (category) {
      const cat = await Category.findOne({ slug: category as string });
      if (cat) {
        // Find tailors who list services in this category
        const services = await Service.find({ category: cat._id });
        const tailorIds = services.map((s) => s.tailor);
        query._id = { $in: tailorIds };
      } else {
        // If category is not found, return empty list
        return res.json([]);
      }
    }

    const tailors = await User.find(query).select('-password');
    return res.json(tailors);
  } catch (error) {
    console.error('Get tailors error:', error);
    return res.status(500).json({ message: 'Server error, failed to fetch tailors.' });
  }
};

// @desc    Get tailor details
// @route   GET /api/tailors/:id
// @access  Public
export const getTailorDetails = async (req: Request, res: Response) => {
  try {
    const tailor = await User.findOne({ _id: req.params.id, role: 'tailor', isBlocked: false }).select('-password');
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }

    const services = await Service.find({ tailor: tailor._id }).populate('category');
    const reviews = await Review.find({ tailor: tailor._id }).populate('customer', 'name profilePicture').sort({ createdAt: -1 });

    return res.json({
      tailor,
      services,
      reviews,
    });
  } catch (error) {
    console.error('Get tailor details error:', error);
    return res.status(500).json({ message: 'Server error, failed to fetch tailor details.' });
  }
};

// @desc    Get current tailor services
// @route   GET /api/tailors/my/services
// @access  Private (Tailor only)
export const getMyServices = async (req: AuthRequest, res: Response) => {
  try {
    const services = await Service.find({ tailor: req.user._id }).populate('category');
    return res.json(services);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Create/Add a service
// @route   POST /api/tailors/my/services
// @access  Private (Tailor only)
export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, name, description, price, baseTimeDays } = req.body;

    if (!categoryId || !name || !price) {
      return res.status(400).json({ message: 'Please provide categoryId, name, and price.' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found.' });
    }

    const service = await Service.create({
      tailor: req.user._id,
      category: categoryId,
      name,
      description: description || '',
      price: parseFloat(price),
      baseTimeDays: parseInt(baseTimeDays || 7),
    });

    const populatedService = await service.populate('category');
    return res.status(201).json(populatedService);
  } catch (error) {
    console.error('Create service error:', error);
    return res.status(500).json({ message: 'Server error, failed to create service.' });
  }
};

// @desc    Update a service
// @route   PUT /api/tailors/my/services/:id
// @access  Private (Tailor only)
export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, tailor: req.user._id });

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    service.name = req.body.name || service.name;
    service.description = req.body.description || service.description;
    if (req.body.price !== undefined) service.price = parseFloat(req.body.price);
    if (req.body.baseTimeDays !== undefined) service.baseTimeDays = parseInt(req.body.baseTimeDays);

    const updatedService = await service.save();
    const populatedService = await updatedService.populate('category');
    return res.json(populatedService);
  } catch (error) {
    console.error('Update service error:', error);
    return res.status(500).json({ message: 'Server error, failed to update service.' });
  }
};

// @desc    Delete a service
// @route   DELETE /api/tailors/my/services/:id
// @access  Private (Tailor only)
export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const service = await Service.findOneAndDelete({ _id: req.params.id, tailor: req.user._id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    return res.json({ message: 'Service removed successfully.' });
  } catch (error) {
    console.error('Delete service error:', error);
    return res.status(500).json({ message: 'Server error, failed to delete service.' });
  }
};
