/**
 * Browsing Routes - Countries
 * GET /api/countries
 * GET /api/countries/:id/universities
 */

const express = require("express");
const prisma = require("../prisma/client");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * GET /api/countries
 * Get all active countries
 */
router.get("/", async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      select: {
        id: true,
        countryName: true,
        region: true,
        currency: true,
        tierLevel: true,
        isActive: true,
      },
      orderBy: { countryName: "asc" },
    });

    return successResponse(res, countries);
  } catch (error) {
    console.error("Get countries error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * GET /api/countries/:id/universities
 * Get all universities in a country
 */
router.get("/:id/universities", async (req, res) => {
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

    const universities = await prisma.university.findMany({
      where: { countryId },
      select: {
        id: true,
        countryId: true,
        universityName: true,
        type: true,
        city: true,
      },
      orderBy: { universityName: "asc" },
    });

    return successResponse(res, universities);
  } catch (error) {
    console.error("Get universities error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
