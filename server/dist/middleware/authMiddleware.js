"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'tailorconnect_secret_key');
            const user = await User_1.User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
            if (user.isBlocked) {
                return res.status(403).json({ message: 'User account has been blocked.' });
            }
            req.user = user;
            next();
        }
        catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: role '${req.user?.role || 'Guest'}' is not authorized.`,
            });
        }
        next();
    };
};
exports.authorize = authorize;
