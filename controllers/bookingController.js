const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const User = require('../models/User'); // পপুলেট করার জন্য User মডেল
const Doctor = require('../models/Doctor'); // প্রয়োজন অনুযায়ী Doctor তথ্য পেতে

// @desc  অ্যাপয়েন্টমেন্ট বুক করা
// @route POST /api/bookings/book
// @access Private
const bookAppointment = asyncHandler(async (req, res) => {
    const { doctorId, date, time, reason } = req.body;
    const patientId = req.user._id;

    // নিশ্চিত করুন যে ব্যবহারকারী একজন রোগী
    if (req.user.role !== 'patient') {
        res.status(403);
        throw new Error('Only patients can book appointments');
    }

    const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        date,
        time,
        reason
    });

    if (appointment) {
        res.status(201).json(appointment);
    } else {
        res.status(400);
        throw new Error('Invalid appointment data');
    }
});

// @desc  একজন রোগীর সকল অ্যাপয়েন্টমেন্ট দেখা
// @route GET /api/bookings/my-appointments
// @access Private
const getMyAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ patient: req.user._id })
        .populate('doctor', 'name email'); // ডাক্তারের নাম এবং ইমেল পপুলেট করা

    res.json(appointments);
});

// @desc  একজন ডাক্তারের সকল অ্যাপয়েন্টমেন্ট দেখা
// @route GET /api/bookings/doctor-appointments
// @access Private/Doctor
const getDoctorAppointments = asyncHandler(async (req, res) => {
    if (req.user.role !== 'doctor') {
        res.status(403);
        throw new Error('Not authorized to view doctor appointments');
    }

    const appointments = await Appointment.find({ doctor: req.user._id })
        .populate('patient', 'name email'); // রোগীর নাম এবং ইমেল পপুলেট করা

    res.json(appointments);
});

// @desc  অ্যাপয়েন্টমেন্ট স্ট্যাটাস আপডেট করা
// @route PUT /api/bookings/:id/status
// @access Private/Doctor
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const appointmentId = req.params.id;

    if (req.user.role !== 'doctor') {
        res.status(403);
        throw new Error('Not authorized to update appointment status');
    }

    const appointment = await Appointment.findById(appointmentId);

    if (appointment) {
        // নিশ্চিত করুন যে ডাক্তার শুধুমাত্র তার নিজের অ্যাপয়েন্টমেন্ট আপডেট করছে
        if (appointment.doctor.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized to update this appointment');
        }

        appointment.status = status;
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

module.exports = {
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus
};