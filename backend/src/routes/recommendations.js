/**
 * Recommendation Routes
 * GET /api/recommendations/countries
 * Returns countries matching user's academic tier
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * Compute user's academic tier based on CGPA
 * > 3.7 => 1 (top tier)
 * 3.2 - 3.7 => 2 (mid tier)
 * else => 3 (lower tier)
 */
function computeTier(cgpa) {
  if (!cgpa) return 3; // Default to lowest if no CGPA
  if (cgpa > 3.7) return 1;
  if (cgpa >= 3.2) return 2;
  return 3;
}

/**
 * GET /api/recommendations/countries
 * Get recommended countries based on user's CGPA tier
 */
router.get("/countries", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;

    // Get user's CGPA
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cgpa: true },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Compute tier
    const tier = computeTier(user.cgpa);

    // Get countries matching tier and active
    const countries = await prisma.country.findMany({
      where: {
        tierLevel: tier,
        isActive: true,
      },
      select: {
        id: true,
        countryName: true,
        region: true,
        currency: true,
        tierLevel: true,
        isActive: true,
      },
    });

    return successResponse(res, {
      userCgpa: user.cgpa,
      tier,
      countries,
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
