"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.createCategory = exports.toggleTailorVerify = exports.toggleUserBlock = exports.getUsers = exports.getAdminStats = void 0;
const User_1 = require("../models/User");
const Order_1 = require("../models/Order");
const Category_1 = require("../models/Category");
const cloudinary_1 = require("../config/cloudinary");
// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
    try {
        const totalCustomers = await User_1.User.countDocuments({ role: 'customer' });
        const totalTailors = await User_1.User.countDocuments({ role: 'tailor' });
        const totalCategories = await Category_1.Category.countDocuments();
        // Aggregates for orders
        const orders = await Order_1.Order.find();
        const totalOrders = orders.length;
        const totalEarnings = orders.reduce((sum, order) => sum + (order.status !== 'Pending' ? order.price : 0), 0);
        // Active status distributions
        const activeOrders = await Order_1.Order.countDocuments({ status: { $nin: ['Pending', 'Delivered'] } });
        const pendingVerifications = await User_1.User.countDocuments({ role: 'tailor', isVerified: false });
        return res.json({
            totalCustomers,
            totalTailors,
            totalCategories,
            totalOrders,
            totalEarnings,
            activeOrders,
            pendingVerifications,
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        return res.status(500).json({ message: 'Server error, failed to get statistics.' });
    }
};
exports.getAdminStats = getAdminStats;
// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};
        if (role)
            query.role = role;
        const users = await User_1.User.find(query).select('-password').sort({ createdAt: -1 });
        return res.json(users);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};
exports.getUsers = getUsers;
// @desc    Toggle block user status
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
const toggleUserBlock = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot block admin accounts.' });
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
        });
    }
    catch (error) {
        console.error('Toggle block error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};
exports.toggleUserBlock = toggleUserBlock;
// @desc    Verify tailor approval status
// @route   PUT /api/admin/tailors/:id/verify
// @access  Private (Admin only)
const toggleTailorVerify = async (req, res) => {
    try {
        const user = await User_1.User.findOne({ _id: req.params.id, role: 'tailor' });
        if (!user) {
            return res.status(404).json({ message: 'Tailor not found.' });
        }
        user.isVerified = !user.isVerified;
        await user.save();
        return res.json({
            _id: user._id,
            name: user.name,
            isVerified: user.isVerified,
        });
    }
    catch (error) {
        console.error('Toggle verify error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};
exports.toggleTailorVerify = toggleTailorVerify;
// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
    try {
        const { name, slug, description } = req.body;
        if (!name || !slug || !description) {
            return res.status(400).json({ message: 'Name, slug, and description are required.' });
        }
        const categoryExists = await Category_1.Category.findOne({ $or: [{ name }, { slug }] });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category name or slug already exists.' });
        }
        let imageUrl = '';
        if (req.file) {
            try {
                imageUrl = await (0, cloudinary_1.uploadImage)(req.file.path, 'categories');
            }
            catch (uploadErr) {
                return res.status(500).json({ message: 'Failed to upload category image.' });
            }
        }
        else {
            return res.status(400).json({ message: 'Category image file is required.' });
        }
        const category = await Category_1.Category.create({
            name,
            slug: slug.toLowerCase(),
            description,
            image: imageUrl,
        });
        return res.status(201).json(category);
    }
    catch (error) {
        console.error('Create category error:', error);
        return res.status(500).json({ message: 'Server error, failed to create category.' });
    }
};
exports.createCategory = createCategory;
// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category_1.Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        return res.json({ message: 'Category deleted successfully.' });
    }
    catch (error) {
        console.error('Delete category error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};
exports.deleteCategory = deleteCategory;
