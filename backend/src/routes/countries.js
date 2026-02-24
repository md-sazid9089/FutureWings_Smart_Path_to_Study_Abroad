/**
 * Browsing Routes
 * 
 * GET /api/countries                          - Get all active countries
 * GET /api/countries/:id/universities         - Get universities in a country
 * GET /api/universities/:id/programs          - Get programs at a university
 * GET /api/scholarships/country/:id           - Get scholarships for a country
 */

const express = require("express");
const prisma = require("../prisma/client");
const { sendSuccess, sendError } = require("../middleware/response");

const router = express.Router();

/**
 * GET /api/countries
 * Get all active countries with optional filtering
 * 
 * Returns: array of countries
 */
router.get("/", async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        tier: true,
        isActive: true,
      },
      orderBy: { tier: "asc" },
    });

    return sendSuccess(res, countries);
  } catch (error) {
    console.error("[Get Countries Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/countries/:id/universities
 * Get all universities in a specific country
 * 
 * Params:
 *   - id: country ID
 * 
 * Returns: array of universities with country details
 */
router.get("/:id/universities", async (req, res) => {
  try {
    const countryId = parseInt(req.params.id);

    // Verify country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return sendError(res, "Country not found", 404);
    }

    const universities = await prisma.university.findMany({
      where: { countryId },
      select: {
        id: true,
        name: true,
        countryId: true,
        location: true,
        ranking: true,
        website: true,
      },
    });

    return sendSuccess(res, universities);
  } catch (error) {
    console.error("[Get Universities Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/universities/:id/programs
 * Get all programs at a specific university
 * 
 * Params:
 *   - id: university ID
 * 
 * Returns: array of programs with university details
 */
router.get("/universities/:id/programs", async (req, res) => {
  try {
    const universityId = parseInt(req.params.id);

    // Verify university exists
    const university = await prisma.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      return sendError(res, "University not found", 404);
    }

    const programs = await prisma.program.findMany({
      where: { universityId },
      select: {
        id: true,
        name: true,
        universityId: true,
        degreeLevel: true,
        duration: true,
        tuitionFee: true,
        description: true,
      },
    });

    return sendSuccess(res, programs);
  } catch (error) {
    console.error("[Get Programs Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/scholarships/country/:id
 * Get all scholarships for a specific country
 * 
 * Params:
 *   - id: country ID
 * 
 * Returns: array of scholarships
 */
router.get("/scholarships/country/:id", async (req, res) => {
  try {
    const countryId = parseInt(req.params.id);

    // Verify country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return sendError(res, "Country not found", 404);
    }

    const scholarships = await prisma.scholarship.findMany({
      where: { countryId },
      select: {
        id: true,
        name: true,
        countryId: true,
        amount: true,
        eligibility: true,
        deadline: true,
      },
    });

    return sendSuccess(res, scholarships);
  } catch (error) {
    console.error("[Get Scholarships Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

module.exports = router;
