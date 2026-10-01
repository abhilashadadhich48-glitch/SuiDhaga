"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id, role) => {
    const secret = process.env.JWT_SECRET || 'tailorconnect_secret_key';
    return jsonwebtoken_1.default.sign({ id, role }, secret, {
        expiresIn: '30d',
    });
};
exports.generateToken = generateToken;
