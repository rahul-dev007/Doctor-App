// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const { protect } = require('../middleware/authMiddleware');
const {
    registerUser,
    loginUser,
    getUserProfile,
    logoutUser,
    getAllUsers
} = require('../controllers/authController');

const router = express.Router();

// Register/Login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes
router.get('/profile', protect, getUserProfile);
router.get('/allusers', protect, getAllUsers);

// Logout
router.get('/logout', logoutUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('http://localhost:5000/dashboard');
});

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
    res.redirect('http://localhost:5000/dashboard');
});

module.exports = router;
