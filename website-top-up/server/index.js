require('dotenv').config({ path: '../../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3001;

// PRODUCTION CORS - Always allow production frontend
app.use(cors({
    origin: 'https://ace-zero.vercel.app',
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB (use same DB as the bot)
const connectDB = async () => {
    try {
        if (!process.env.DB) {
            throw new Error('Missing DB connection string in .env');
        }
        await mongoose.connect(process.env.DB);
        console.log('💰 Top-Up Server connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Hemiko Gold Top-Up' });
});

// API info
app.get('/api', (req, res) => {
    res.json({
        name: 'Hemiko Gold Top-Up API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth/login',
            packages: '/api/payment/packages',
            createPayment: '/api/payment/create',
            checkStatus: '/api/payment/status/:transactionId',
            history: '/api/payment/history/:discordId'
        }
    });
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🪙 Hemiko Gold Top-Up Server running on port ${PORT}`);
    });
});

module.exports = app;
