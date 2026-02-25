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
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, user);
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

    // Build update data (only include provided fields)
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (degreeLevel !== undefined) updateData.degreeLevel = degreeLevel;
    if (major !== undefined) updateData.major = major;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (fundScore !== undefined) updateData.fundScore = fundScore;

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

module.exports = router;
