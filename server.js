// server.js
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
        origin: ["http://localhost:3000"], // frontend URL ঠিক করুন
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
    origin: "http://localhost:3000", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(
    cookieSession({
        name: 'session',
        keys: [process.env.JWT_SECRET],
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })
);

app.use(passport.initialize());
app.use(passport.session());

// ----------------------
// MongoDB Connection
// ----------------------
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// ----------------------
// Socket.io setup
// ----------------------
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('sendMessage', (data) => {
        console.log(`Message from ${socket.id}: ${data.message}`);
        io.emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

// ----------------------
// Routes
// ----------------------
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Basic test route
app.get('/', (req, res) => {
    res.send('Doctor/Service Provider Management Platform Backend is running!');
});

// ----------------------
// Start server
// ----------------------
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
