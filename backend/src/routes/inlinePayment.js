const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { requireAuth } = require('../middleware/auth');
const prisma = require('../prisma/client');

// Inline payment intent creation for Stripe Elements
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const { paymentMethodId, amount } = req.body;
    const userId = req.auth.userId;
    if (!paymentMethodId || !amount) {
      return res.status(400).json({ error: 'Missing payment method or amount.' });
    }

    // Create PaymentIntent with confirmation
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: { userId: userId.toString(), featureType: 'PREMIUM_BUNDLE' },
    });

    console.log('[Stripe] PaymentIntent created:', paymentIntent.id, 'Status:', paymentIntent.status);

    // If payment succeeded, update user premium status and save payment details
    if (paymentIntent.status === 'succeeded') {
      const userUpdate = await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true },
      });
      console.log('[DB] User premium status updated:', userUpdate.id, 'isPremium:', userUpdate.isPremium);

      // Save payment details in Payment table
      const paymentRecord = await prisma.payment.create({
        data: {
          userId: userId,
          stripeSessionId: paymentIntent.id, // PaymentIntent ID as session
          stripePaymentId: paymentIntent.latest_charge || null,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          featureType: paymentIntent.metadata.featureType || 'PREMIUM_BUNDLE',
          status: 'SUCCESS',
          completedAt: new Date(),
        },
      });
      console.log('[DB] Payment record created:', paymentRecord.id, 'Status:', paymentRecord.status);
    } else {
      // Save failed or pending payment attempt
      const paymentRecord = await prisma.payment.create({
        data: {
          userId: userId,
          stripeSessionId: paymentIntent.id,
          stripePaymentId: paymentIntent.latest_charge || null,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          featureType: paymentIntent.metadata.featureType || 'PREMIUM_BUNDLE',
          status: paymentIntent.status.toUpperCase(),
        },
      });
      console.log('[DB] Payment record created (not succeeded):', paymentRecord.id, 'Status:', paymentRecord.status);
    }

    res.json({ client_secret: paymentIntent.client_secret, status: paymentIntent.status });
  } catch (err) {
    console.error('Payment Intent Error:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
