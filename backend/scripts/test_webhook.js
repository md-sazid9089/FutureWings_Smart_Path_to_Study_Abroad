require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

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
      customer_email: 'demo@futurewings.com',
      metadata: {
        userId: '3',
        featureType: 'SOP_TESTING'
      }
    }
  }
});

const timestamp = Math.floor(Date.now() / 1000);
const signature = stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp });

axios.post(
  'http://localhost:5000/api/payments/webhook',
  payload,
  {
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature
    },
    transformRequest: [(data) => data]
  }
)
  .then(r => {
    console.log('SUCCESS - Status:', r.status);
    console.log('Response:', JSON.stringify(r.data, null, 2));
  })
  .catch(e => {
    console.error('FAILED - Status:', e.response?.status);
    console.error('Error:', JSON.stringify(e.response?.data, null, 2));
  });
