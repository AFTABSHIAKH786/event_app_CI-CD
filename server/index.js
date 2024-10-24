// server/index.js
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const crypto = require('crypto');
// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Verify environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be provided in .env file');
    process.exit(1);
}

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Create order route
app.post('/api/create-order', async (req, res) => {
    console.log('Received order creation request:', req.body);
    
    try {
        const { amount, bookingId } = req.body;

        if (!amount || !bookingId) {
            return res.status(400).json({
                success: false,
                error: 'Amount and bookingId are required'
            });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in paise, rounded to ensure integer
            currency: 'INR',
            receipt: bookingId,
            payment_capture: 1
        };

        console.log('Creating order with options:', options);

        const order = await razorpay.orders.create(options);
        
        console.log('Order created successfully:', order);

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order'
        });
    }
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the server by visiting: http://localhost:${PORT}/test`);
});