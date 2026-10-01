"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
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
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    designReferences: [
        {
            type: String,
        },
    ],
    selectedMeasurements: {
        upperBody: {
            chest: { type: Number, default: 0 },
            shoulder: { type: Number, default: 0 },
            waist: { type: Number, default: 0 },
            sleeveLength: { type: Number, default: 0 },
        },
        lowerBody: {
            hip: { type: Number, default: 0 },
            inseam: { type: Number, default: 0 },
            outseam: { type: Number, default: 0 },
            waist: { type: Number, default: 0 },
        },
        accents: {
            neck: { type: Number, default: 0 },
            wrist: { type: Number, default: 0 },
            ankle: { type: Number, default: 0 },
        },
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: [
            'Pending',
            'Fabric Sourcing',
            'Cutting & Preparation',
            'Hand-stitching',
            'Final Pressing',
            'Dispatched',
            'Delivered',
        ],
        default: 'Pending',
    },
    milestoneTimeline: [
        {
            status: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            note: { type: String, default: '' },
            mediaUrl: { type: String, default: '' },
        },
    ],
    notes: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});
OrderSchema.index({ customer: 1 });
OrderSchema.index({ tailor: 1 });
exports.Order = (0, mongoose_1.model)('Order', OrderSchema);
