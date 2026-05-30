require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

(async () => {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const payload = JSON.stringify({
      id: 'evt_test_' + Date.now(),
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          object: 'checkout.session',
          payment_status: 'paid',
          customer: null,
          customer_email: 'demo@futurewings.com',
          metadata: {
            userId: '3',
            featureType: 'SOP_TESTING'
          }
        }
      }
    });

    const timestamp = Math.floor(Date.now() / 1000);
    // stripe.webhooks.generateTestHeaderString is provided by stripe SDK for testing
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp });

    console.log('Sending webhook with signature:', signature);

    const res = await axios.post('http://localhost:5000/api/payments/webhook', payload, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature
      },
      validateStatus: () => true,
    });

    console.log('Webhook response status:', res.status);
    console.log('Webhook response data:', res.data);
  } catch (e) {
    console.error('Error sending webhook:', e.message || e);
    if (e.response) {
      console.error('Response data:', e.response.data);
    }
    process.exit(1);
  }
})();
