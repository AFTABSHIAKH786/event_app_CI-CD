// src/utils/razorpayUtils.js
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Convert date to timestamp
export const getFirebaseTimestamp = (date) => {
  return new Date(date);
};

// Format price for Razorpay (convert to paise)
export const formatPriceForRazorpay = (price) => {
  return price * 100;
};