import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../utils/token';
import { AuthRequest } from '../middleware/authMiddleware';
import { uploadImage } from '../config/cloudinary';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
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
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data.' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error, failed to register.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account is blocked.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
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
      token: generateToken(user._id.toString(), user.role),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error, failed to log in.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

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
        const imageUrl = await uploadImage(req.file.path, 'profiles');
        user.profilePicture = imageUrl;
      } catch (uploadErr) {
        return res.status(500).json({ message: 'Failed to upload profile image.' });
      }
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
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
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error, update failed.' });
  }
};

// @desc    Update customer measurements
// @route   PUT /api/auth/measurements
// @access  Private (Customer only)
export const updateMeasurements = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

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
  } catch (error) {
    console.error('Update measurements error:', error);
    return res.status(500).json({ message: 'Server error, failed to update measurements.' });
  }
};
