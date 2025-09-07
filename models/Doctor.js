//models/Doctor.js

const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    // User মডেলের সাথে সম্পর্ক (relationship) স্থাপন করা
    // এটি User মডেলের ObjectId-কে রেফারেন্স করে
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true // নিশ্চিত করে যে একজন User-এর জন্য শুধুমাত্র একটি Doctor প্রোফাইল থাকবে
    },
    specialization: {
        type: String,
        required: true,
    },
    degree: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
        default: 0
    },
    clinicAddress: {
        type: String,
        required: true,
    },
    consultationFee: {
        type: Number,
        required: true,
        default: 0
    },
    isApproved: {
        type: Boolean,
        required: true,
        default: false
    },
}, {
    timestamps: true,
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;