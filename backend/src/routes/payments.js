/**
 * Payment Routes - Stripe Integration
 * POST /api/payments/create-checkout-session
 * GET /api/payments/status
 * POST /api/payments/webhook
 * GET /api/payments/history
 * GET /api/payments/verify-session/:sessionId
 */

const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

// Feature pricing in cents (USD)
const FEATURE_PRICING = {
  PREMIUM_BUNDLE: 14999, // $149.99
  AI_HELP: 4999,        // $49.99
  VISA_CONSULTANCY: 9999, // $99.99
};

// Feature bundles - which features each type unlocks
const FEATURE_BUNDLES = {
  PREMIUM_BUNDLE: ["AI_HELP", "VISA_CONSULTANCY", "SCHOLARSHIPS"],
  AI_HELP: ["AI_HELP"],
  VISA_CONSULTANCY: ["VISA_CONSULTANCY"],
};

/**
 * POST /api/payments/create-checkout-session
 * Create a Stripe checkout session for premium features
 */
router.post("/create-checkout-session", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { featureType = "PREMIUM_BUNDLE" } = req.body;

    // Validate feature type
    if (!FEATURE_PRICING[featureType]) {
      return errorResponse(res, `Invalid feature type: ${featureType}`, 400);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName || "User",
        metadata: { userId: userId.toString() },
      });
      stripeCustomerId = customer.id;

      // Save Stripe customer ID to database
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Premium Access - ${featureType.replace(/_/g, " ")}`,
              description: `Unlock ${featureType.replace(/_/g, " ")} features for 1 month`,
            },
            unit_amount: FEATURE_PRICING[featureType],
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/premium-checkout`,
      metadata: {
        userId: userId.toString(),
        featureType: featureType,
      },
    });

    // Create payment record in database with PENDING status
    const payment = await prisma.payment.create({
      data: {
        userId,
        stripeSessionId: session.id,
        amount: FEATURE_PRICING[featureType],
        currency: "USD",
        featureType,
        status: "PENDING",
      },
    });

    return successResponse(res, {
      sessionId: session.id,
      url: session.url,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return errorResponse(res, "Failed to create checkout session", 500);
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 * This should be called with raw body (not JSON parsed)
 */
async function webhookHandler(req, res) {
  const sig = req.headers["stripe-signature"];

  try {
    // Debug: inspect incoming body and headers to ensure raw Buffer is present
    console.log('Webhook incoming - content-type:', req.headers['content-type']);
    console.log('Webhook incoming - isBuffer:', Buffer.isBuffer(req.body), 'type:', typeof req.body);

    // req.body is expected to be the raw Buffer because server registers express.raw for this path
    const rawBody = req.body;

    const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log('Stripe Session Data (webhook):', JSON.stringify(session, null, 2));

      // Validate metadata exists (userId is required to activate the user)
      if (!session.metadata || !session.metadata.userId) {
        console.error('Missing metadata.userId in webhook event — cannot activate premium', session);
        return res.status(200).json({ received: true });
      }

      const featureType = session.metadata.featureType || "PREMIUM_BUNDLE";
      const features = FEATURE_BUNDLES[featureType] || [featureType];
      const userId = parseInt(session.metadata.userId, 10);

      if (isNaN(userId)) {
        console.error('Invalid metadata.userId:', session.metadata.userId);
        return res.status(200).json({ received: true });
      }

      // Try to find the existing payment record
      let payment = await prisma.payment.findFirst({
        where: { stripeSessionId: session.id },
      });

      if (!payment) {
        // No pre-existing payment record (e.g. test/CLI events or race conditions).
        // Create one so there is an audit trail and proceed to activate the user.
        console.log(`No payment record for session ${session.id} — creating one and activating user ${userId}`);
        payment = await prisma.payment.create({
          data: {
            userId,
            stripeSessionId: session.id,
            stripePaymentId: session.payment_intent || null,
            amount: session.amount_total || 0,
            currency: (session.currency || "usd").toUpperCase(),
            featureType,
            status: "SUCCESS",
            completedAt: new Date(),
          },
        });
      } else {
        // Update existing record to SUCCESS
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            stripePaymentId: session.payment_intent || payment.stripePaymentId,
            completedAt: new Date(),
          },
        });
      }

      // Activate premium features for the user
      const premiumExpiryDate = new Date();
      premiumExpiryDate.setDate(premiumExpiryDate.getDate() + 30); // 30 days

      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumFeatures: features.join(","),
          premiumExpiryDate,
        },
      });

      console.log(`✅ Premium activated for user ${userId}, features: ${features.join(", ")}`);
    }

    // Handle charge.failed event
    if (event.type === "charge.failed") {
      const charge = event.data.object;
      const session = charge.checkout_session;

      if (session) {
        const payment = await prisma.payment.findFirst({
          where: { stripeSessionId: session },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}

// expose handler for direct registration when express.raw is applied in server.js
router.post("/webhook", webhookHandler);
module.exports = Object.assign(router, { webhookHandler });

/**
 * GET /api/payments/status
 * Get user's premium subscription status
 */
router.get("/status", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        premiumFeatures: true,
        premiumExpiryDate: true,
      },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Check if premium has expired
    let isPremium = user.isPremium;
    if (isPremium && user.premiumExpiryDate && user.premiumExpiryDate < new Date()) {
      isPremium = false;
      // Optionally update the database to mark as expired
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false, premiumFeatures: null },
      });
    }

    const features = user.premiumFeatures ? user.premiumFeatures.split(",") : [];

    return successResponse(res, {
      isPremium,
      features,
      expiryDate: user.premiumExpiryDate,
      daysRemaining: isPremium && user.premiumExpiryDate 
        ? Math.ceil((user.premiumExpiryDate - new Date()) / (1000 * 60 * 60 * 24))
        : 0,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return errorResponse(res, "Failed to fetch subscription status", 500);
  }
});

/**
 * GET /api/payments/history
 * Get user's payment history
 */
router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        featureType: true,
        amount: true,
        status: true,
        createdAt: true,
        completedAt: true,
      },
    });

    return successResponse(res, payments);
  } catch (error) {
    console.error("Payment history error:", error);
    return errorResponse(res, "Failed to fetch payment history", 500);
  }
});

/**
 * GET /api/payments/verify-session/:sessionId
 * Verify a checkout session (used after redirect from Stripe)
 */
router.get("/verify-session/:sessionId", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.auth.userId;

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe Session Data (verify-session):', session);

    if (!session) {
      return errorResponse(res, "Session not found", 404);
    }

    // Defensive checks for required fields
    if (!session.metadata || !session.amount_total) {
      console.error('Missing required session data: metadata or amount_total', session);
      return errorResponse(res, "Internal Server Error: Missing session data", 500);
    }

    // Verify it belongs to the current user
    if (session.metadata.userId !== userId.toString()) {
      return errorResponse(res, "Unauthorized", 403);
    }

    // Get payment record
    let payment = await prisma.payment.findFirst({
      where: { stripeSessionId: sessionId },
    });

    // Helper: activate premium for the user
    const activatePremium = async (paymentUserId) => {
      const features = FEATURE_BUNDLES[session.metadata.featureType] || [session.metadata.featureType];
      const premiumExpiryDate = new Date();
      premiumExpiryDate.setDate(premiumExpiryDate.getDate() + 30);

      const user = await prisma.user.findUnique({
        where: { id: paymentUserId },
      });

      let updatedFeatures = features;
      if (user?.premiumFeatures) {
        const existingFeatures = user.premiumFeatures.split(",").filter(f => f);
        updatedFeatures = Array.from(new Set([...existingFeatures, ...features]));
      }

      await prisma.user.update({
        where: { id: paymentUserId },
        data: {
          isPremium: true,
          premiumFeatures: updatedFeatures.join(","),
          premiumExpiryDate,
        },
      });

      console.log(`✓ Premium activated for user ${paymentUserId}, features: ${updatedFeatures.join(", ")}`);
    };

    if (session.payment_status === "paid") {
      if (!payment) {
        // No payment record exists — create one with SUCCESS status
        payment = await prisma.payment.create({
          data: {
            userId: parseInt(session.metadata.userId),
            stripeSessionId: sessionId,
            stripePaymentId: session.payment_intent,
            amount: session.amount_total,
            currency: session.currency?.toUpperCase() || "USD",
            featureType: session.metadata.featureType,
            status: "SUCCESS",
            completedAt: new Date(),
          },
        });

        await activatePremium(userId);
      } else if (payment.status !== "SUCCESS") {
        // Payment record exists but is still PENDING — update it to SUCCESS
        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            stripePaymentId: session.payment_intent,
            completedAt: new Date(),
          },
        });

        await activatePremium(payment.userId);
      }
    }

    if (!payment) {
      return errorResponse(res, "Payment not yet processed", 400);
    }

    return successResponse(res, {
      status: payment.status,
      featureType: payment.featureType,
      amount: payment.amount,
      paymentStatus: session.payment_status, // "paid" or "unpaid"
      verified: true,
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return errorResponse(res, "Failed to verify session", 500);
  }
});

module.exports = router;
