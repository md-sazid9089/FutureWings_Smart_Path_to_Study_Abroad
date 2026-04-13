/**
 * User Profile Routes
 * GET /api/user/me
 * PUT /api/user/me
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * GET /api/user/me
 * Get current user profile
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        cgpa: true,
        degreeLevel: true,
        major: true,
        fundScore: true,
        isPremium: true,
        premiumFeatures: true,
        premiumExpiryDate: true,
        stripeCustomerId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Check if premium has expired
    let isPremium = user.isPremium;
    if (isPremium && user.premiumExpiryDate && user.premiumExpiryDate < new Date()) {
      isPremium = false;
      // Reset premium status if expired
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false, premiumFeatures: null },
      });
    }

    return successResponse(res, {
      ...user,
      isPremium,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/user/me
 * Update user profile
 * Body: { fullName?, degreeLevel?, major?, cgpa?, fundScore? }
 */
router.put("/me", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { fullName, degreeLevel, major, cgpa, fundScore } = req.body;

    // Build update data (only include provided fields, coerce types)
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (degreeLevel !== undefined) updateData.degreeLevel = degreeLevel;
    if (major !== undefined) updateData.major = major;
    if (cgpa !== undefined) updateData.cgpa = cgpa !== '' && cgpa !== null ? parseFloat(cgpa) : null;
    if (fundScore !== undefined) updateData.fundScore = fundScore !== '' && fundScore !== null ? parseInt(fundScore, 10) : null;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        cgpa: true,
        degreeLevel: true,
        major: true,
        fundScore: true,
        createdAt: true,
      },
    });

    return successResponse(res, user);
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * POST /api/user/get-started
 * Instantly set isPremium true when user clicks Get Started
 */
router.post("/get-started", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true, premiumExpiryDate: new Date() },
    });
    return successResponse(res, { message: "Premium status updated, you can now complete the payment." });
  } catch (error) {
    console.error("Error updating user status:", error);
    return errorResponse(res, "Error updating user premium status.", 500);
  }
});

module.exports = router;
