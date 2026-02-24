/**
 * Rating Routes
 * 
 * POST /api/ratings                       - Create rating for a country after visa outcome
 * GET /api/countries/:id/ratings-summary - Get average rating and count for a country
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { sendSuccess, sendError } = require("../middleware/response");

const router = express.Router();

/**
 * POST /api/ratings
 * Create a rating for a country after visa outcome is received
 * 
 * Body:
 *   - applicationId: number
 *   - countryId: number
 *   - ratingValue: number (1-5)
 *   - comments: string (optional)
 * 
 * Returns: created rating object
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { applicationId, countryId, ratingValue, comments } = req.body;

    // Validation
    if (!applicationId || !countryId || !ratingValue) {
      return sendError(res, "Missing required fields: applicationId, countryId, ratingValue", 400);
    }

    if (ratingValue < 1 || ratingValue > 5) {
      return sendError(res, "Rating value must be between 1 and 5", 400);
    }

    // Verify application exists and belongs to user
    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) },
    });

    if (!application) {
      return sendError(res, "Application not found", 404);
    }

    if (application.userId !== req.auth.userId) {
      return sendError(res, "Forbidden - Application does not belong to user", 403);
    }

    // Verify visa outcome exists
    const visaOutcome = await prisma.visaOutcome.findUnique({
      where: { applicationId: parseInt(applicationId) },
    });

    if (!visaOutcome) {
      return sendError(res, "Visa outcome not yet available for this application", 400);
    }

    // Verify country exists
    const country = await prisma.country.findUnique({
      where: { id: parseInt(countryId) },
    });

    if (!country) {
      return sendError(res, "Country not found", 404);
    }

    // Create rating
    const rating = await prisma.countryRating.create({
      data: {
        userId: req.auth.userId,
        applicationId: parseInt(applicationId),
        countryId: parseInt(countryId),
        ratingValue: parseInt(ratingValue),
        comments: comments || null,
      },
    });

    return sendSuccess(res, rating, 201);
  } catch (error) {
    console.error("[Create Rating Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/countries/:id/ratings-summary
 * Get average rating and count for a country
 * 
 * Params:
 *   - id: country ID
 * 
 * Returns: { average, count }
 */
router.get("/countries/:id/ratings-summary", async (req, res) => {
  try {
    const countryId = parseInt(req.params.id);

    // Verify country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return sendError(res, "Country not found", 404);
    }

    // Get all ratings for the country
    const ratings = await prisma.countryRating.findMany({
      where: { countryId },
      select: { ratingValue: true },
    });

    if (ratings.length === 0) {
      return sendSuccess(res, {
        countryId,
        average: 0,
        count: 0,
      });
    }

    // Calculate average
    const sum = ratings.reduce((acc, r) => acc + r.ratingValue, 0);
    const average = Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal

    return sendSuccess(res, {
      countryId,
      average,
      count: ratings.length,
    });
  } catch (error) {
    console.error("[Get Ratings Summary Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

module.exports = router;
