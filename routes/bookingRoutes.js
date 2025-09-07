const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus
} = require('../controllers/bookingController');

const router = express.Router();

// @route POST /api/bookings/book
// @desc  একজন রোগী দ্বারা অ্যাপয়েন্টমেন্ট বুক করা
// @access Private
router.post('/book', protect, bookAppointment);

// @route GET /api/bookings/my-appointments
// @desc  একজন রোগীর সকল অ্যাপয়েন্টমেন্ট দেখা
// @access Private
router.get('/my-appointments', protect, getMyAppointments);

// @route GET /api/bookings/doctor-appointments
// @desc  একজন ডাক্তারের সকল অ্যাপয়েন্টমেন্ট দেখা
// @access Private/Doctor
router.get('/doctor-appointments', protect, getDoctorAppointments);

// @route PUT /api/bookings/:id/status
// @desc  একজন ডাক্তারের অ্যাপয়েন্টমেন্ট স্ট্যাটাস আপডেট করা
// @access Private/Doctor
router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;