/**
 * Visa Outcome Routes
 * GET /api/applications/:id/visa-outcome
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * GET /api/applications/:id/visa-outcome
 * Get visa outcome for an application
 */
router.get("/:id/visa-outcome", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;
    const applicationId = parseInt(id, 10);

    if (isNaN(applicationId)) {
      return errorResponse(res, "Invalid application ID", 400);
    }

    // Get application and check ownership
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { userId: true, visaOutcome: true },
    });

    if (!application) {
      return errorResponse(res, "Application not found", 404);
    }

    // Check ownership
    if (application.userId !== userId) {
      return errorResponse(res, "Forbidden", 403);
    }

    if (!application.visaOutcome) {
      return errorResponse(res, "Visa outcome not found", 404);
    }

    return successResponse(res, application.visaOutcome);
  } catch (error) {
    console.error("Get visa outcome error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
