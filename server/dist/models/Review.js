"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    order: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true,
    },
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tailor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});
ReviewSchema.index({ tailor: 1 });
exports.Review = (0, mongoose_1.model)('Review', ReviewSchema);
