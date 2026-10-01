"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMeasurements = exports.updateProfile = exports.getMe = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const token_1 = require("../utils/token");
const cloudinary_1 = require("../config/cloudinary");
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, city } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password.' });
        }
        const userExists = await User_1.User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer',
            city: city || '',
        });
        if (user) {
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                token: (0, token_1.generateToken)(user._id.toString(), user.role),
            });
        }
        else {
            return res.status(400).json({ message: 'Invalid user data.' });
        }
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error, failed to register.' });
    }
};
exports.registerUser = registerUser;
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account is blocked.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            profilePicture: user.profilePicture,
            isVerified: user.isVerified,
            token: (0, token_1.generateToken)(user._id.toString(), user.role),
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error, failed to log in.' });
    }
};
exports.loginUser = loginUser;
// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id).select('-password');
        if (user) {
            return res.json(user);
        }
        else {
            return res.status(404).json({ message: 'User not found.' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error.' });
    }
};
exports.getMe = getMe;
// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.name = req.body.name || user.name;
        user.city = req.body.city || user.city;
        if (user.role === 'tailor') {
            user.bio = req.body.bio || user.bio;
        }
        if (req.file) {
            try {
                const imageUrl = await (0, cloudinary_1.uploadImage)(req.file.path, 'profiles');
                user.profilePicture = imageUrl;
            }
            catch (uploadErr) {
                return res.status(500).json({ message: 'Failed to upload profile image.' });
            }
        }
        if (req.body.password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            user.password = await bcryptjs_1.default.hash(req.body.password, salt);
        }
        const updatedUser = await user.save();
        return res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            city: updatedUser.city,
            profilePicture: updatedUser.profilePicture,
            bio: updatedUser.bio,
            isVerified: updatedUser.isVerified,
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Server error, update failed.' });
    }
};
exports.updateProfile = updateProfile;
// @desc    Update customer measurements
// @route   PUT /api/auth/measurements
// @access  Private (Customer only)
const updateMeasurements = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.role !== 'customer') {
            return res.status(403).json({ message: 'Only customers can update measurements.' });
        }
        const { upperBody, lowerBody, accents } = req.body;
        user.measurements = {
            upperBody: { ...(user.measurements?.upperBody || {}), ...upperBody },
            lowerBody: { ...(user.measurements?.lowerBody || {}), ...lowerBody },
            accents: { ...(user.measurements?.accents || {}), ...accents },
        };
        const updatedUser = await user.save();
        return res.json(updatedUser.measurements);
    }
    catch (error) {
        console.error('Update measurements error:', error);
        return res.status(500).json({ message: 'Server error, failed to update measurements.' });
    }
};
exports.updateMeasurements = updateMeasurements;
