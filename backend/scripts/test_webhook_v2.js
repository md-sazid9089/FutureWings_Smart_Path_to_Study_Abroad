/**
 * test_webhook_v2.js
 * End-to-end Stripe webhook test using Node's built-in http module.
 *
 * Key differences from test_webhook.js:
 *  - Uses Node's built-in `http` module (no axios / no re-serialization risk)
 *  - Manually computes HMAC-SHA256 using the raw secret bytes
 *    (base64-decodes the whsec_ payload per Stripe's actual algorithm)
 *  - The EXACT same bytes that are signed are sent over the wire
 *
 * Run from backend/ directory:
 *   node scripts/test_webhook_v2.js
 *
 * Expected output:
 *   Status: 200
 *   SUCCESS — webhook accepted
 */

require('dotenv').config();
const crypto = require('crypto');
const http   = require('http');

const rawSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!rawSecret) {
  console.error('ERROR: STRIPE_WEBHOOK_SECRET is not set in .env');
  process.exit(1);
}

// Stripe's constructEvent base64-decodes the part after "whsec_"
const secretBytes = Buffer.from(rawSecret.replace('whsec_', ''), 'base64');

// Build the fake event payload — include amount_total so webhook logic proceeds
const sessionId = 'cs_test_' + Date.now();
const eventId   = 'evt_test_' + Date.now();

const payload = JSON.stringify({
  id:     eventId,
  object: 'event',
  type:   'checkout.session.completed',
  data: {
    object: {
      id:             sessionId,
      object:         'checkout.session',
      payment_status: 'paid',
      payment_intent: 'pi_test_' + Date.now(),
      amount_total:   4999,
      currency:       'usd',
      customer_email: 'demo@futurewings.com',
      metadata: {
        userId:      '3',
        featureType: 'SOP_TESTING',
      },
    },
  },
});

// ── HMAC-SHA256 signature (identical algorithm to stripe.webhooks.constructEvent) ──
const timestamp    = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;

const hmac = crypto
  .createHmac('sha256', secretBytes)
  .update(signedPayload, 'utf8')
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${hmac}`;

// ── HTTP request ──────────────────────────────────────────────────────────────
const bodyBuffer = Buffer.from(payload, 'utf8');

const options = {
  hostname: 'localhost',
  port:     5000,
  path:     '/api/payments/webhook',
  method:   'POST',
  headers: {
    'Content-Type':   'application/json',
    'Content-Length': bodyBuffer.length,
    'stripe-signature': stripeSignature,
  },
};

console.log('Sending test webhook to http://localhost:5000/api/payments/webhook');
console.log('Event type  :', 'checkout.session.completed');
console.log('Session ID  :', sessionId);
console.log('Signature   :', stripeSignature.slice(0, 50) + '...');
console.log('');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status  :', res.statusCode);
    console.log('Response:', data);
    if (res.statusCode === 200) {
      console.log('\n✅  SUCCESS — webhook accepted (200)');
      console.log('    Run: node scripts/check_demo_user.js  to verify DB update');
    } else {
      console.log('\n❌  FAILED — check backend logs for details');
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  console.error('Is the backend running on http://localhost:5000?');
  process.exit(1);
});

req.write(bodyBuffer);
req.end();
