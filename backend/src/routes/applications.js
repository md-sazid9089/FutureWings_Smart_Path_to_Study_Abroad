/**
 * Applications Routes
 * POST /api/applications (create application)
 * GET /api/applications (list user's applications)
 * GET /api/applications/:id (get application details)
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * Helper: Get or create "Pending" status
 */
async function getPendingStatus() {
  let status = await prisma.applicationStatus.findUnique({
    where: { statusName: "Pending" },
  });

  if (!status) {
    status = await prisma.applicationStatus.create({
      data: { statusName: "Pending" },
    });
  }

  return status;
}

/**
 * POST /api/applications
 * Create a new application
 * Body: { countryId, programId, intakeApplied? }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { countryId, programId, intakeApplied } = req.body;

    // Validation
    if (!countryId || !programId) {
      return errorResponse(
        res,
        "countryId and programId are required",
        400
      );
    }

    const countryIdNum = parseInt(countryId, 10);
    const programIdNum = parseInt(programId, 10);

    if (isNaN(countryIdNum) || isNaN(programIdNum)) {
      return errorResponse(res, "Invalid country or program ID", 400);
    }

    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { id: countryIdNum },
    });

    if (!country) {
      return errorResponse(res, "Country not found", 404);
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programIdNum },
    });

    if (!program) {
      return errorResponse(res, "Program not found", 404);
    }

    // Get or create "Pending" status
    const pendingStatus = await getPendingStatus();

    // Create application
    const application = await prisma.application.create({
      data: {
        userId,
        countryId: countryIdNum,
        programId: programIdNum,
        statusId: pendingStatus.id,
        intakeApplied: intakeApplied || null,
      },
      include: {
        country: {
          select: { id: true, countryName: true },
        },
        program: {
          select: { id: true, programName: true },
        },
        status: {
          select: { id: true, statusName: true },
        },
        visaOutcome: true,
      },
    });

    return successResponse(res, application, 201);
  } catch (error) {
    console.error("Create application error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * GET /api/applications
 * Get all applications for the current user
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        country: {
          select: { id: true, countryName: true },
        },
        program: {
          select: { id: true, programName: true, universityId: true },
        },
        status: {
          select: { id: true, statusName: true },
        },
        visaOutcome: true,
      },
      orderBy: { appliedDate: "desc" },
    });

    return successResponse(res, applications);
  } catch (error) {
    console.error("Get applications error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * GET /api/applications/:id
 * Get specific application details
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;
    const applicationId = parseInt(id, 10);

    if (isNaN(applicationId)) {
      return errorResponse(res, "Invalid application ID", 400);
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        country: {
          select: { id: true, countryName: true, region: true, currency: true },
        },
        program: {
          select: { id: true, programName: true, level: true, tuitionPerYear: true },
        },
        status: {
          select: { id: true, statusName: true },
        },
        visaOutcome: true,
        user: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    if (!application) {
      return errorResponse(res, "Application not found", 404);
    }

    // Check ownership (user can only view their own applications)
    if (application.userId !== userId) {
      return errorResponse(res, "Forbidden", 403);
    }

    return successResponse(res, application);
  } catch (error) {
    console.error("Get application error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
