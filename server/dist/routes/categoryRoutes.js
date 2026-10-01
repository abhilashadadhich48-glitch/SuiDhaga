"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Category_1 = require("../models/Category");
const router = (0, express_1.Router)();
// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category_1.Category.find().sort({ name: 1 });
        return res.json(categories);
    }
    catch (error) {
        console.error('Get categories error:', error);
        return res.status(500).json({ message: 'Server error, failed to fetch categories.' });
    }
});
exports.default = router;
