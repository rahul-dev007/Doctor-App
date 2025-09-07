const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // প্রেরককে User মডেলের সাথে যুক্ত করা
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // প্রাপককে User মডেলের সাথে যুক্ত করা
    },
    content: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    },
}, {
    timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;