// server/routes/payment.js
const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


router.get("/",(req, res) => {
  res.send("HEllo api is working!")
})

// Create order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    const options = {
      amount: amount * 100, // convert to paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Log payment data for debugging
    console.log("Payment Data:", req.body);

    // Check if the signature is present
    if (!razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Signature is missing'
      });
    }

    // Verify signature
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    // Log generated and received signatures for debugging
    console.log("Generated Signature:", generated_signature);
    console.log("Received Signature:", razorpay_signature);

    if (generated_signature === razorpay_signature) {
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Error verifying payment'
    });
  }
});

module.exports = router;
