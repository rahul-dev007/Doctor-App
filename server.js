require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cookieSession = require('cookie-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');

// Models & Passport config
require('./models/User');
require('./services/passport');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// ----------------------
// Middleware
// ----------------------
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(
    cookieSession({
        name: 'session',
        keys: [process.env.JWT_SECRET],
        maxAge: 30 * 24 * 60 * 60 * 1000
    })
);

app.use(passport.initialize());
app.use(passport.session());

// ----------------------
// MongoDB Connection
// ----------------------
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully!'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// ----------------------
// Socket.io setup
// ----------------------
io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // User joins a room identified by their user ID
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User with socket ID ${socket.id} joined room: ${userId}`);
    });

    // Send a message to a specific room
    socket.on('send_message', (data) => {
        console.log(`💬 Message received from ${data.senderId} to ${data.receiverId}`);
        // Send the message to the receiver's room
        io.to(data.receiverId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// 👇 This line is now in the correct place, before the routes
app.set('socketio', io);

// ----------------------
// Routes
// ----------------------
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);

// Basic test route
app.get('/', (req, res) => {
    res.send('Doctor/Service Provider Management Platform Backend is running!');
});

// ----------------------
// Start server
// ----------------------
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});