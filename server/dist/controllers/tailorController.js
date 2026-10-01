"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getMyServices = exports.getTailorDetails = exports.getTailors = void 0;
const User_1 = require("../models/User");
const Service_1 = require("../models/Service");
const Category_1 = require("../models/Category");
const Review_1 = require("../models/Review");
// @desc    Get all tailors (with optional filters)
// @route   GET /api/tailors
// @access  Public
const getTailors = async (req, res) => {
    try {
        const { city, category, search, minRating } = req.query;
        let query = { role: 'tailor', isBlocked: false };
        // 1. Filter by city (case-insensitive search)
        if (city) {
            query.city = { $regex: new RegExp(city, 'i') };
        }
        // 2. Filter by search query (name or bio)
        if (search) {
            query.$or = [
                { name: { $regex: new RegExp(search, 'i') } },
                { bio: { $regex: new RegExp(search, 'i') } },
            ];
        }
        // 3. Filter by minimum rating
        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }
        // 4. Filter by category slug
        if (category) {
            const cat = await Category_1.Category.findOne({ slug: category });
            if (cat) {
                // Find tailors who list services in this category
                const services = await Service_1.Service.find({ category: cat._id });
                const tailorIds = services.map((s) => s.tailor);
                query._id = { $in: tailorIds };
            }
            else {
                // If category is not found, return empty list
                return res.json([]);
            }
        }
        const tailors = await User_1.User.find(query).select('-password');
        return res.json(tailors);
    }
    catch (error) {
        console.error('Get tailors error:', error);
        return res.status(500).json({ message: 'Server error, failed to fetch tailors.' });
    }
};
exports.getTailors = getTailors;
// @desc    Get tailor details
// @route   GET /api/tailors/:id
// @access  Public
const getTailorDetails = async (req, res) => {
    try {
        const tailor = await User_1.User.findOne({ _id: req.params.id, role: 'tailor', isBlocked: false }).select('-password');
        if (!tailor) {
            return res.status(404).json({ message: 'Tailor not found.' });
        }
        const services = await Service_1.Service.find({ tailor: tailor._id }).populate('category');
        const reviews = await Review_1.Review.find({ tailor: tailor._id }).populate('customer', 'name profilePicture').sort({ createdAt: -1 });
        return res.json({
            tailor,
            services,
            reviews,
        });
    }
    catch (error) {
        console.error('Get tailor details error:', error);
        return res.status(500).json({ message: 'Server error, failed to fetch tailor details.' });
    }
};
exports.getTailorDetails = getTailorDetails;
// @desc    Get current tailor services
// @route   GET /api/tailors/my/services
// @access  Private (Tailor only)
const getMyServices = async (req, res) => {
    try {
        const services = await Service_1.Service.find({ tailor: req.user._id }).populate('category');
        return res.json(services);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};
exports.getMyServices = getMyServices;
// @desc    Create/Add a service
// @route   POST /api/tailors/my/services
// @access  Private (Tailor only)
const createService = async (req, res) => {
    try {
        const { categoryId, name, description, price, baseTimeDays } = req.body;
        if (!categoryId || !name || !price) {
            return res.status(400).json({ message: 'Please provide categoryId, name, and price.' });
        }
        const category = await Category_1.Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({ message: 'Category not found.' });
        }
        const service = await Service_1.Service.create({
            tailor: req.user._id,
            category: categoryId,
            name,
            description: description || '',
            price: parseFloat(price),
            baseTimeDays: parseInt(baseTimeDays || 7),
        });
        const populatedService = await service.populate('category');
        return res.status(201).json(populatedService);
    }
    catch (error) {
        console.error('Create service error:', error);
        return res.status(500).json({ message: 'Server error, failed to create service.' });
    }
};
exports.createService = createService;
// @desc    Update a service
// @route   PUT /api/tailors/my/services/:id
// @access  Private (Tailor only)
const updateService = async (req, res) => {
    try {
        const service = await Service_1.Service.findOne({ _id: req.params.id, tailor: req.user._id });
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        service.name = req.body.name || service.name;
        service.description = req.body.description || service.description;
        if (req.body.price !== undefined)
            service.price = parseFloat(req.body.price);
        if (req.body.baseTimeDays !== undefined)
            service.baseTimeDays = parseInt(req.body.baseTimeDays);
        const updatedService = await service.save();
        const populatedService = await updatedService.populate('category');
        return res.json(populatedService);
    }
    catch (error) {
        console.error('Update service error:', error);
        return res.status(500).json({ message: 'Server error, failed to update service.' });
    }
};
exports.updateService = updateService;
// @desc    Delete a service
// @route   DELETE /api/tailors/my/services/:id
// @access  Private (Tailor only)
const deleteService = async (req, res) => {
    try {
        const service = await Service_1.Service.findOneAndDelete({ _id: req.params.id, tailor: req.user._id });
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        return res.json({ message: 'Service removed successfully.' });
    }
    catch (error) {
        console.error('Delete service error:', error);
        return res.status(500).json({ message: 'Server error, failed to delete service.' });
    }
};
exports.deleteService = deleteService;
