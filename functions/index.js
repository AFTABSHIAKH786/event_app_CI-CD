const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');

admin.initializeApp();

const razorpay = new Razorpay({
  key_id: functions.config().razorpay.key_id,
  key_secret: functions.config().razorpay.key_secret
});

exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create an order.');
  }

  const { amount, currency = 'INR', receipt } = data;

  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    return {
      orderId: order.id,
      currency: order.currency,
      amount: order.amount
    };
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    throw new functions.https.HttpsError('internal', 'Unable to create Razorpay order');
  }
});