/**
 * Recommendation Routes
 * 
 * GET /api/recommendations/countries - Get recommended countries based on user CGPA
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { sendSuccess, sendError } = require("../middleware/response");

const router = express.Router();

/**
 * Compute tier level based on CGPA
 * >3.7   => tier 1
 * 3.2-3.7 => tier 2
 * else    => tier 3
 */
function computeTier(cgpa) {
  if (cgpa === null || cgpa === undefined) return 3;
  if (cgpa > 3.7) return 1;
  if (cgpa >= 3.2) return 2;
  return 3;
}

/**
 * GET /api/recommendations/countries
 * Get countries recommended based on user's CGPA tier
 * 
 * Query:
 *   - limit: number (optional, default: 10)
 * 
 * Returns: array of countries
 */
router.get("/countries", requireAuth, async (req, res) => {
  try {
    // Get user's CGPA
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: { cgpa: true },
    });

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Compute tier based on CGPA
    const userTier = computeTier(user.cgpa);

    // Get countries matching the tier and active status
    const countries = await prisma.country.findMany({
      where: {
        tier: userTier,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        tier: true,
        isActive: true,
      },
    });

    return sendSuccess(res, {
      userTier,
      cgpa: user.cgpa,
      countries,
    });
  } catch (error) {
    console.error("[Get Recommendations Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

module.exports = router;
