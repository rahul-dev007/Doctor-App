const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// @desc  মেসেজ পাঠানো এবং সেভ করা
// @route POST /api/messages/send
// @access Private
const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, content, appointmentId } = req.body;
    const senderId = req.user._id;

    // মেসেজটি ডাটাবেসে সেভ করা
    const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        appointment: appointmentId // ঐচ্ছিক, যদি আপনি অ্যাপয়েন্টমেন্টের সাথে মেসেজ যুক্ত করতে চান
    });

    // Socket.IO ইনস্ট্যান্সটি Express থেকে নেওয়া
    const io = req.app.get('socketio');

    if (io) {
        // রিয়েল-টাইমে মেসেজ পাঠানো
        // এটি প্রাপকের রুমে মেসেজ পাঠাবে
        io.to(receiverId.toString()).emit('receive_message', message);

        // চাইলে প্রেরকের রুমেও মেসেজ পাঠানো যেতে পারে যাতে ফ্রন্টএন্ড আপডেট হয়
        io.to(senderId.toString()).emit('receive_message', message);
    }

    res.status(201).json(message);
});

// @desc  নির্দিষ্ট চ্যাটের সকল মেসেজ দেখা
// @route GET /api/messages/:receiverId
// @access Private
const getMessages = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const otherUserId = req.params.receiverId;

    // sender এবং receiver এর আইডি ব্যবহার করে সকল মেসেজ খুঁজে বের করা
    const messages = await Message.find({
        $or: [
            { sender: currentUserId, receiver: otherUserId },
            { sender: otherUserId, receiver: currentUserId }
        ]
    }).sort({ createdAt: 1 }); // মেসেজগুলো সময় অনুযায়ী সাজানো

    res.json(messages);
});

module.exports = {
    sendMessage,
    getMessages
};