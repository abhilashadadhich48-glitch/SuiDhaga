"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const mongoose_1 = require("mongoose");
const ServiceSchema = new mongoose_1.Schema({
    tailor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    baseTimeDays: {
        type: Number,
        required: true,
        default: 7,
        min: 1,
    },
}, {
    timestamps: true,
});
ServiceSchema.index({ tailor: 1, category: 1 });
exports.Service = (0, mongoose_1.model)('Service', ServiceSchema);
