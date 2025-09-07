const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // রোগীকে User মডেলের সাথে যুক্ত করা
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // ডাক্তারকে User মডেলের সাথে যুক্ত করা
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending',
    },
    // রোগীর সমস্যা বা অ্যাপয়েন্টমেন্টের কারণ
    reason: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;