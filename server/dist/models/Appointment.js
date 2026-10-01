"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = void 0;
const mongoose_1 = require("mongoose");
const AppointmentSchema = new mongoose_1.Schema({
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
    date: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    notes: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});
AppointmentSchema.index({ tailor: 1, date: 1 });
AppointmentSchema.index({ customer: 1 });
exports.Appointment = (0, mongoose_1.model)('Appointment', AppointmentSchema);
