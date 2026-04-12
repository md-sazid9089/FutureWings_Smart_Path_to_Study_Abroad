/**
 * EXAMPLE: How to integrate notifications into the payments route
 * This shows the exact code snippets to add to backend/src/routes/payments.js
 * 
 * NOTE: This is a reference file. Copy the code snippets to the actual payments.js file.
 */

// ============================================================================
// 1. ADD THIS IMPORT AT THE TOP OF payments.js
// ============================================================================

const { createNotification, notificationTemplates } = require("../utils/notifications");

// ============================================================================
// 2. IN THE WEBHOOK HANDLER - When Stripe checkout completes
// ============================================================================

// Find the section in payments.js that handles 'checkout.session.completed'
// Add this code AFTER the payment record is created in the database:

// EXAMPLE: In the webhook handler after creating payment record
const webhookHandler = async (req, res) => {
  // ... existing code ...
  
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // ... existing database logic ...
    
    // NOW ADD THIS: Create notification for user
    try {
      const user = await prisma.user.findUnique({
        where: { stripeId: session.customer },
      });

      if (user) {
        // Get the subscription plan details from session metadata
        const planName = session.metadata?.planName || "Premium";
        const features = JSON.parse(session.metadata?.features || '[]');
        const featureList = features.length > 0 
          ? features.join(", ") 
          : "premium features";

        await createNotification(
          user.id,
          "subscription",
          "✨ Premium Subscription Activated",
          `Congratulations! Your ${planName} subscription is now active. Enjoy ${featureList}!`,
          "/profile?tab=subscription"
        );

        console.log(`[NOTIFICATION] Sent subscription notification to user ${user.id}`);
      }
    } catch (notifError) {
      console.error("[NOTIFICATION ERROR] Failed to create notification:", notifError);
      // Don't throw - let payment processing continue even if notification fails
    }
  }
};

// ============================================================================
// 3. IN THE WEBHOOK HANDLER - When payment fails
// ============================================================================

// Add this code for 'charge.failed' event:

if (event.type === "charge.failed") {
  const charge = event.data.object;

  try {
    const user = await prisma.user.findUnique({
      where: { stripeId: charge.customer },
    });

    if (user) {
      await createNotification(
        user.id,
        "subscription",
        "❌ Payment Failed",
        "Your payment could not be processed. Please update your payment method and try again.",
        "/premium?retry=true"
      );

      console.log(`[NOTIFICATION] Sent payment failed notification to user ${user.id}`);
    }
  } catch (notifError) {
    console.error("[NOTIFICATION ERROR] Failed to create payment failed notification:", notifError);
  }
}

// ============================================================================
// 4. IN THE SUBSCRIPTION STATUS ENDPOINT
// ============================================================================

// If you have a renew subscription endpoint, add this:

router.post("/renew-subscription/:subscriptionId", auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    // ... existing renewal logic ...

    // After successful renewal, add this:
    await createNotification(
      userId,
      "subscription",
      "🔄 Subscription Renewed",
      "Your subscription has been successfully renewed for another month!",
      "/profile?tab=subscription"
    );

    return res.status(200).json({ 
      success: true, 
      message: "Subscription renewed successfully" 
    });
  } catch (error) {
    console.error("Error renewing subscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 5. IN THE CANCEL SUBSCRIPTION ENDPOINT
// ============================================================================

router.post("/cancel-subscription/:subscriptionId", auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    // ... existing cancellation logic ...

    // After successful cancellation, add this:
    await createNotification(
      userId,
      "subscription",
      "📋 Subscription Cancelled",
      "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      "/premium"
    );

    return res.status(200).json({ 
      success: true, 
      message: "Subscription cancelled successfully" 
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// EXAMPLE: Integration into recommendations route
// ============================================================================

// In backend/src/routes/recommendations.js (or ai-assistant.js)

const { createNotification } = require("../utils/notifications");

router.post("/generate", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    // ... existing AI recommendation logic ...
    
    const recommendation = await aiService.generateRecommendation(preferences);

    if (recommendation) {
      // Create notification
      await createNotification(
        userId,
        "ai",
        "🎯 New Recommendation Found",
        `We found an excellent match: ${recommendation.universityName} - ${recommendation.programName}`,
        `/programs/${recommendation.programId}`
      );
    }

    return res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    console.error("Error generating recommendation:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// EXAMPLE: Integration into applications route
// ============================================================================

const { createNotification } = require("../utils/notifications");

router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) },
      include: { program: { include: { university: true } } },
    });

    if (!application || application.userId !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Update status
    const updated = await prisma.application.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    // Create notification for status change
    const statusMessages = {
      submitted: "Your application has been submitted successfully!",
      shortlisted: "Great news! You've been shortlisted.",
      rejected: "Unfortunately, your application was not selected.",
      accepted: "🎉 Congratulations! You've been accepted!",
      pending: "Your application is under review.",
    };

    await createNotification(
      userId,
      "application",
      `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `${application.program.university.name} - ${statusMessages[status] || "Status updated"}`,
      `/applications/${id}`
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// EXAMPLE: Admin route - Adding new country notification
// ============================================================================

const { createBulkNotifications } = require("../utils/notifications");

router.post("/admin/countries", auth, adminMiddleware, async (req, res) => {
  try {
    const { name, description, costOfLiving } = req.body;

    // Create country
    const country = await prisma.country.create({
      data: { name, description, costOfLiving },
    });

    // Notify all users about new country
    const allUsers = await prisma.user.findMany({
      where: { role: "user" },
      select: { id: true },
    });

    const userIds = allUsers.map((u) => u.id);

    if (userIds.length > 0) {
      await createBulkNotifications(
        userIds,
        "admin-update",
        "🌍 New Country Added",
        `${name} has been added to our platform! Explore new opportunities.`,
        `/countries/${country.id}`
      );
    }

    return res.status(201).json({ success: true, data: country });
  } catch (error) {
    console.error("Error creating country:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// EXAMPLE: Visa outcome notifications
// ============================================================================

router.post("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId, outcome, notes } = req.body;

    // Create visa outcome
    const visaOutcome = await prisma.visaOutcome.create({
      data: {
        userId,
        applicationId: parseInt(applicationId),
        outcome,
        notes,
      },
      include: {
        application: {
          include: { program: { include: { university: true } } },
        },
      },
    });

    // Create notification
    const outcomeMessages = {
      approved: "🎉 Visa Approved! Safe travels!",
      rejected: "😔 Unfortunately, your visa was not approved.",
      pending: "📋 Your visa application is under review.",
      appealed: "📤 Your appeal has been submitted.",
    };

    await createNotification(
      userId,
      "visa",
      `Visa ${outcome}`,
      `${visaOutcome.application.program.university.name} - ${outcomeMessages[outcome]}`,
      `/visa-outcomes/${visaOutcome.id}`
    );

    return res.status(201).json({ success: true, data: visaOutcome });
  } catch (error) {
    console.error("Error creating visa outcome:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// ERROR HANDLING PATTERN
// ============================================================================

// Always wrap notification creation in try-catch to prevent route failures:

try {
  await createNotification(
    userId,
    "subscription",
    "Title",
    "Message",
    "/link"
  );
} catch (notifError) {
  // Log but don't throw - notification failure shouldn't break the main flow
  console.error("[NOTIFICATION ERROR]", notifError);
}

// ============================================================================
// KEY POINTS
// ============================================================================

/*
1. Always use try-catch around createNotification() calls
2. Don't throw errors from notifications - log and continue
3. Use notificationTemplates for consistency
4. Include relevant links in notifications (3rd parameter)
5. Keep messages under 500 characters
6. Use emojis in titles for visual distinction
7. For bulk operations, use createBulkNotifications()
8. Use consistent notification types: subscription, visa, ai, recommendation, application, admin-update
*/
