"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderReview = exports.updateOrderStatus = exports.getOrderById = exports.getOrders = exports.placeOrder = void 0;
const Order_1 = require("../models/Order");
const Service_1 = require("../models/Service");
const User_1 = require("../models/User");
const Review_1 = require("../models/Review");
const cloudinary_1 = require("../config/cloudinary");
// @desc    Place a custom stitching order
// @route   POST /api/orders
// @access  Private (Customer only)
const placeOrder = async (req, res) => {
    try {
        const { serviceId, notes, selectedMeasurements } = req.body;
        if (!serviceId) {
            return res.status(400).json({ message: 'Service ID is required.' });
        }
        const service = await Service_1.Service.findById(serviceId).populate('tailor');
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        // Handle design reference files if uploaded
        let designReferences = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                try {
                    const url = await (0, cloudinary_1.uploadImage)(file.path, 'design_refs');
                    designReferences.push(url);
                }
                catch (uploadErr) {
                    console.error('File upload error during order placement:', uploadErr);
                }
            }
        }
        const order = await Order_1.Order.create({
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
    }
    catch (error) {
        console.error('Place order error:', error);
        return res.status(500).json({ message: 'Server error, failed to place order.' });
    }
};
exports.placeOrder = placeOrder;
// @desc    Get user orders (customer/tailor/admin specific lists)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'customer') {
            query.customer = req.user._id;
        }
        else if (req.user.role === 'tailor') {
            query.tailor = req.user._id;
        }
        const orders = await Order_1.Order.find(query)
            .populate('customer', 'name email profilePicture')
            .populate('tailor', 'name email profilePicture city')
            .populate({
            path: 'service',
            populate: { path: 'category' },
        })
            .sort({ createdAt: -1 });
        return res.json(orders);
    }
    catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({ message: 'Server error, failed to get orders.' });
    }
};
exports.getOrders = getOrders;
// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order_1.Order.findById(req.params.id)
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
        if (req.user.role !== 'admin' &&
            order.customer._id.toString() !== req.user._id.toString() &&
            order.tailor._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this order.' });
        }
        // Check if review exists for this order
        const review = await Review_1.Review.findOne({ order: order._id });
        return res.json({ order, review });
    }
    catch (error) {
        console.error('Get order by ID error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};
exports.getOrderById = getOrderById;
// @desc    Update order progress milestone
// @route   PUT /api/orders/:id/status
// @access  Private (Tailor only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order_1.Order.findOne({ _id: req.params.id, tailor: req.user._id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found or unauthorized.' });
        }
        let mediaUrl = '';
        if (req.file) {
            try {
                mediaUrl = await (0, cloudinary_1.uploadImage)(req.file.path, 'milestones');
            }
            catch (uploadErr) {
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
    }
    catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({ message: 'Server error, failed to update order.' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// @desc    Submit review for a completed order
// @route   POST /api/orders/:id/review
// @access  Private (Customer only)
const createOrderReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const orderId = req.params.id;
        if (!rating || !comment) {
            return res.status(400).json({ message: 'Please provide rating and comment.' });
        }
        const order = await Order_1.Order.findOne({ _id: orderId, customer: req.user._id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found or unauthorized.' });
        }
        if (order.status !== 'Delivered') {
            return res.status(400).json({ message: 'You can only review orders that are fully delivered.' });
        }
        const reviewExists = await Review_1.Review.findOne({ order: orderId });
        if (reviewExists) {
            return res.status(400).json({ message: 'You have already reviewed this order.' });
        }
        const review = await Review_1.Review.create({
            order: orderId,
            customer: req.user._id,
            tailor: order.tailor,
            rating: Number(rating),
            comment,
        });
        // Update Tailor average rating
        const tailorReviews = await Review_1.Review.find({ tailor: order.tailor });
        const avgRating = tailorReviews.reduce((sum, r) => sum + r.rating, 0) / tailorReviews.length;
        await User_1.User.findByIdAndUpdate(order.tailor, {
            rating: parseFloat(avgRating.toFixed(1)),
            numReviews: tailorReviews.length,
        });
        return res.status(201).json(review);
    }
    catch (error) {
        console.error('Create review error:', error);
        return res.status(500).json({ message: 'Server error, failed to create review.' });
    }
};
exports.createOrderReview = createOrderReview;
