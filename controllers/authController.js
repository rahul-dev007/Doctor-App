const User = require('../models/User');
const Doctor = require('../models/Doctor'); // নতুন Doctor মডেল ইম্পোর্ট করা
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// JWT টোকেন জেনারেট করার ফাংশন
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    ইউজার রেজিস্ট্রেশন (ডাক্তার এবং রোগী উভয়ের জন্য)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // Doctor-এর অতিরিক্ত ফিল্ডগুলো destructure করা হয়েছে
    const { name, email, password, role, specialization, degree, clinicAddress, consultationFee } = req.body;

    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error('Please enter all required fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // নতুন User তৈরি করা
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    if (user) {
        const token = generateToken(user._id);

        // যদি ইউজারটি ডাক্তার হয়, তবে Doctor মডেলে অতিরিক্ত তথ্য সংরক্ষণ করা
        if (role === 'doctor') {
            // ডাক্তারের জন্য প্রয়োজনীয় ফিল্ডগুলো নিশ্চিত করা
            if (!specialization || !degree || !clinicAddress) {
                // যদি ডাক্তারের ফিল্ড না থাকে, তাহলে User-কে ডিলিট করে ত্রুটি জানানো
                await User.deleteOne({ _id: user._id });
                res.status(400);
                throw new Error('Please provide all required fields for doctor registration');
            }

            // নতুন Doctor প্রোফাইল তৈরি করা
            const doctorProfile = await Doctor.create({
                user: user._id,
                specialization,
                degree,
                clinicAddress,
                consultationFee,
                isApproved: false
            });

            res.status(201).cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'Lax'
            }).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: token,
                doctorProfile: doctorProfile
            });
        } else {
            // যদি রোগী বা অন্য কোনো রোল হয়
            res.status(201).cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'Lax'
            }).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: token,
            });
        }
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    বর্তমান লগইন করা ইউজার সম্পর্কে তথ্য
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // 'populate' ব্যবহার করে User থেকে Doctor তথ্য লোড করা
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        // যদি ইউজারটি ডাক্তার হয়, তবে Doctor প্রোফাইলটিও খুঁজে বের করা
        let doctorProfile = null;
        if (user.role === 'doctor') {
            doctorProfile = await Doctor.findOne({ user: user._id });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            googleId: user.googleId,
            facebookId: user.facebookId,
            doctorProfile: doctorProfile // ডাক্তারের অতিরিক্ত তথ্য এখানে পাঠানো হচ্ছে
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    ইউজার লগইন
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);

        // যদি ইউজারটি ডাক্তার হয়, তবে তার Doctor প্রোফাইলটিও খুঁজে বের করা
        let doctorProfile = null;
        if (user.role === 'doctor') {
            doctorProfile = await Doctor.findOne({ user: user._id });
        }

        res.status(200).cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'Lax'
        }).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
            doctorProfile: doctorProfile // ডাক্তারের তথ্য লগইনের সময় পাঠানো
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get all users (Admin only)
// @route   GET /api/auth/allusers
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized as admin');
    }

    // populate ব্যবহার করে প্রতিটি User-এর সাথে তার Doctor প্রোফাইল যুক্ত করা
    const users = await User.find().select('-password');

    // প্রতিটি ইউজারের জন্য তার Doctor প্রোফাইল খুঁজে বের করা
    const usersWithProfiles = await Promise.all(users.map(async (user) => {
        if (user.role === 'doctor') {
            const doctorProfile = await Doctor.findOne({ user: user._id });
            return { ...user._doc, doctorProfile };
        }
        return user._doc;
    }));

    res.json(usersWithProfiles);
});

// @desc    ইউজার লগআউট
// @route   GET /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    logoutUser,
    getAllUsers
};