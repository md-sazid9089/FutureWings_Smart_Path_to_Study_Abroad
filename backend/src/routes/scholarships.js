/**
 * Scholarships Routes
 * GET /api/scholarships/country/:id
 */

const express = require("express");
const prisma = require("../prisma/client");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * GET /api/scholarships/country/:id
 * Get all scholarships in a country
 */
router.get("/country/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const countryId = parseInt(id, 10);

    if (isNaN(countryId)) {
      return errorResponse(res, "Invalid country ID", 400);
    }

    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return errorResponse(res, "Country not found", 404);
    }

    const scholarships = await prisma.scholarship.findMany({
      where: { countryId },
      select: {
        id: true,
        countryId: true,
        scholarshipName: true,
        eligibilityCriteria: true,
        applyLink: true,
        deadline: true,
        amount: true,
      },
      orderBy: { deadline: "desc" },
    });

    return successResponse(res, scholarships);
  } catch (error) {
    console.error("Get scholarships error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
