"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatus = exports.getAppointments = exports.bookAppointment = void 0;
const Appointment_1 = require("../models/Appointment");
const User_1 = require("../models/User");
// @desc    Book a consultation appointment
// @route   POST /api/appointments
// @access  Private (Customer only)
const bookAppointment = async (req, res) => {
    try {
        const { tailorId, date, timeSlot, notes } = req.body;
        if (!tailorId || !date || !timeSlot) {
            return res.status(400).json({ message: 'Please provide tailorId, date, and timeSlot.' });
        }
        const tailor = await User_1.User.findOne({ _id: tailorId, role: 'tailor', isBlocked: false });
        if (!tailor) {
            return res.status(404).json({ message: 'Tailor not found.' });
        }
        // Check for double booking on the same time slot for that tailor
        const existingAppointment = await Appointment_1.Appointment.findOne({
            tailor: tailorId,
            date: new Date(date),
            timeSlot,
            status: 'Approved',
        });
        if (existingAppointment) {
            return res.status(400).json({ message: 'This time slot is already booked and approved.' });
        }
        const appointment = await Appointment_1.Appointment.create({
            customer: req.user._id,
            tailor: tailorId,
            date: new Date(date),
            timeSlot,
            notes: notes || '',
            status: 'Pending',
        });
        return res.status(201).json(appointment);
    }
    catch (error) {
        console.error('Book appointment error:', error);
        return res.status(500).json({ message: 'Server error, booking failed.' });
    }
};
exports.bookAppointment = bookAppointment;
// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'customer') {
            query.customer = req.user._id;
        }
        else if (req.user.role === 'tailor') {
            query.tailor = req.user._id;
        }
        const appointments = await Appointment_1.Appointment.find(query)
            .populate('customer', 'name email profilePicture')
            .populate('tailor', 'name email profilePicture city')
            .sort({ date: 1, timeSlot: 1 });
        return res.json(appointments);
    }
    catch (error) {
        console.error('Get appointments error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};
exports.getAppointments = getAppointments;
// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Tailor only)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body; // Approved or Rejected
        const appointmentId = req.params.id;
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Choose Approved or Rejected.' });
        }
        const appointment = await Appointment_1.Appointment.findOne({ _id: appointmentId, tailor: req.user._id });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found or unauthorized.' });
        }
        appointment.status = status;
        const updatedAppointment = await appointment.save();
        return res.json(updatedAppointment);
    }
    catch (error) {
        console.error('Update appointment error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
