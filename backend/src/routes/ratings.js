/**
 * Ratings Routes
 * POST /api/ratings (create rating)
 * GET /api/countries/:id/ratings-summary (get country ratings summary)
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * POST /api/ratings
 * Create a rating for a country after visa outcome
 * Body: { countryId, applicationId, ratingValue, comments? }
 * - ensures visa outcome exists
 * - ensures application belongs to user
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { countryId, applicationId, ratingValue, comments } = req.body;

    // Validation
    if (!countryId || !applicationId || ratingValue === undefined) {
      return errorResponse(
        res,
        "countryId, applicationId, and ratingValue are required",
        400
      );
    }

    if (ratingValue < 1 || ratingValue > 5) {
      return errorResponse(res, "ratingValue must be between 1 and 5", 400);
    }

    const countryIdNum = parseInt(countryId, 10);
    const applicationIdNum = parseInt(applicationId, 10);

    if (isNaN(countryIdNum) || isNaN(applicationIdNum)) {
      return errorResponse(res, "Invalid country or application ID", 400);
    }

    // Check if application exists and belongs to user
    const application = await prisma.application.findUnique({
      where: { id: applicationIdNum },
      select: { userId: true, countryId: true, visaOutcome: true },
    });

    if (!application) {
      return errorResponse(res, "Application not found", 404);
    }

    if (application.userId !== userId) {
      return errorResponse(res, "Forbidden: Application does not belong to user", 403);
    }

    if (application.countryId !== countryIdNum) {
      return errorResponse(
        res,
        "Country ID does not match application",
        400
      );
    }

    // Check if visa outcome exists for this application
    if (!application.visaOutcome) {
      return errorResponse(
        res,
        "Cannot rate: Visa outcome not found for this application",
        400
      );
    }

    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { id: countryIdNum },
    });

    if (!country) {
      return errorResponse(res, "Country not found", 404);
    }

    // Check if rating already exists (unique constraint per user+country+ratingType)
    const existingRating = await prisma.countryRating.findUnique({
      where: {
        userId_countryId_ratingType: {
          userId,
          countryId: countryIdNum,
          ratingType: "POST",
        },
      },
    });

    if (existingRating) {
      return errorResponse(
        res,
        "You have already rated this country",
        400
      );
    }

    // Create rating
    const rating = await prisma.countryRating.create({
      data: {
        userId,
        countryId: countryIdNum,
        applicationId: applicationIdNum,
        ratingValue,
        comments: comments || null,
        ratingType: "POST",
      },
    });

    return successResponse(res, rating, 201);
  } catch (error) {
    console.error("Create rating error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * GET /api/countries/:id/ratings-summary
 * Get average rating and count for a country
 */
router.get("/countries/:id/summary", async (req, res) => {
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

    // Get ratings for this country
    const ratings = await prisma.countryRating.findMany({
      where: { countryId },
      select: { ratingValue: true },
    });

    if (ratings.length === 0) {
      return successResponse(res, {
        countryId,
        averageRating: null,
        count: 0,
      });
    }

    const sum = ratings.reduce((acc, r) => acc + r.ratingValue, 0);
    const averageRating = sum / ratings.length;

    return successResponse(res, {
      countryId,
      averageRating: parseFloat(averageRating.toFixed(2)),
      count: ratings.length,
    });
  } catch (error) {
    console.error("Get ratings summary error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
