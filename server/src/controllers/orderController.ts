import { Response } from 'express';
import { Order } from '../models/Order';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { Review } from '../models/Review';
import { AuthRequest } from '../middleware/authMiddleware';
import { uploadImage } from '../config/cloudinary';

// @desc    Place a custom stitching order
// @route   POST /api/orders
// @access  Private (Customer only)
export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, notes, selectedMeasurements } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required.' });
    }

    const service = await Service.findById(serviceId).populate('tailor');
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // Handle design reference files if uploaded
    let designReferences: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          const url = await uploadImage((file as Express.Multer.File).path, 'design_refs');
          designReferences.push(url);
        } catch (uploadErr) {
          console.error('File upload error during order placement:', uploadErr);
        }
      }
    }

    const order = await Order.create({
      customer: req.user._id,
      tailor: service.tailor._id,
      service: serviceId,
      designReferences,
      selectedMeasurements: selectedMeasurements || req.user.measurements,
      price: service.price,
      notes: notes || '',
      status: 'Pending',
      milestoneTimeline: [
        {
          status: 'Pending',
          note: 'Stitching request submitted. Awaiting confirmation from tailor.',
        },
      ],
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Place order error:', error);
    return res.status(500).json({ message: 'Server error, failed to place order.' });
  }
};

// @desc    Get user orders (customer/tailor/admin specific lists)
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'tailor') {
      query.tailor = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email profilePicture')
      .populate('tailor', 'name email profilePicture city')
      .populate({
        path: 'service',
        populate: { path: 'category' },
      })
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Server error, failed to get orders.' });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email profilePicture measurements')
      .populate('tailor', 'name email profilePicture city bio')
      .populate({
        path: 'service',
        populate: { path: 'category' },
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Security check
    if (
      req.user.role !== 'admin' &&
      order.customer._id.toString() !== req.user._id.toString() &&
      order.tailor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }

    // Check if review exists for this order
    const review = await Review.findOne({ order: order._id });

    return res.json({ order, review });
  } catch (error) {
    console.error('Get order by ID error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update order progress milestone
// @route   PUT /api/orders/:id/status
// @access  Private (Tailor only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findOne({ _id: req.params.id, tailor: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized.' });
    }

    let mediaUrl = '';
    if (req.file) {
      try {
        mediaUrl = await uploadImage(req.file.path, 'milestones');
      } catch (uploadErr) {
        return res.status(500).json({ message: 'Failed to upload milestone photo.' });
      }
    }

    order.status = status;
    order.milestoneTimeline.push({
      status,
      note: note || `Order updated to: ${status}`,
      mediaUrl,
      timestamp: new Date(),
    });

    const updatedOrder = await order.save();
    return res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Server error, failed to update order.' });
  }
};

// @desc    Submit review for a completed order
// @route   POST /api/orders/:id/review
// @access  Private (Customer only)
export const createOrderReview = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const orderId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide rating and comment.' });
    }

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized.' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'You can only review orders that are fully delivered.' });
    }

    const reviewExists = await Review.findOne({ order: orderId });
    if (reviewExists) {
      return res.status(400).json({ message: 'You have already reviewed this order.' });
    }

    const review = await Review.create({
      order: orderId,
      customer: req.user._id,
      tailor: order.tailor,
      rating: Number(rating),
      comment,
    });

    // Update Tailor average rating
    const tailorReviews = await Review.find({ tailor: order.tailor });
    const avgRating = tailorReviews.reduce((sum, r) => sum + r.rating, 0) / tailorReviews.length;

    await User.findByIdAndUpdate(order.tailor, {
      rating: parseFloat(avgRating.toFixed(1)),
      numReviews: tailorReviews.length,
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ message: 'Server error, failed to create review.' });
  }
};
