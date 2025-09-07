const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    sendMessage,
    getMessages
} = require('../controllers/messageController');

const router = express.Router();

// @route POST /api/messages/send
// @desc  একটি নতুন মেসেজ পাঠানো
// @access Private
router.post('/send', protect, sendMessage);

// @route GET /api/messages/:receiverId
// @desc  একজন নির্দিষ্ট ইউজারের সাথে সকল মেসেজ দেখা
// @access Private
router.get('/:receiverId', protect, getMessages);

module.exports = router;