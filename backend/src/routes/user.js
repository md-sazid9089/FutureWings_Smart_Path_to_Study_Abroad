/**
 * User Routes
 * 
 * GET /api/user/me        - Get current user profile
 * PUT /api/user/me        - Update current user profile
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { sendSuccess, sendError } = require("../middleware/response");

const router = express.Router();

/**
 * GET /api/user/me
 * Get current authenticated user's profile
 * 
 * Returns: { id, email, fullname, cgpa, degreeLevel, major, fundScore, role, createdAt }
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: {
        id: true,
        email: true,
        fullname: true,
        cgpa: true,
        degreeLevel: true,
        major: true,
        fundScore: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    console.error("[Get User Profile Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/user/me
 * Update current user's profile
 * 
 * Body:
 *   - fullname: string (optional)
 *   - cgpa: number (optional)
 *   - degreeLevel: string (optional)
 *   - major: string (optional)
 *   - fundScore: number (optional)
 * 
 * Returns: updated user object
 */
router.put("/me", requireAuth, async (req, res) => {
  try {
    const { fullname, cgpa, degreeLevel, major, fundScore } = req.body;

    // Build update object only with provided fields
    const updateData = {};
    if (fullname !== undefined) updateData.fullname = fullname;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (degreeLevel !== undefined) updateData.degreeLevel = degreeLevel;
    if (major !== undefined) updateData.major = major;
    if (fundScore !== undefined) updateData.fundScore = fundScore;

    const updatedUser = await prisma.user.update({
      where: { id: req.auth.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullname: true,
        cgpa: true,
        degreeLevel: true,
        major: true,
        fundScore: true,
        role: true,
        updatedAt: true,
      },
    });

    return sendSuccess(res, updatedUser);
  } catch (error) {
    console.error("[Update User Profile Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

module.exports = router;
