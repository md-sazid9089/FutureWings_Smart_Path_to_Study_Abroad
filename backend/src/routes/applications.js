/**
 * Application Routes
 * 
 * POST /api/applications                  - Create new application
 * GET /api/applications                   - Get user's applications
 * GET /api/applications/:id                - Get specific application
 * GET /api/applications/:id/visa-outcome  - Get visa outcome for application
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { sendSuccess, sendError } = require("../middleware/response");

const router = express.Router();

/**
 * POST /api/applications
 * Create a new application for a program
 * 
 * Body:
 *   - countryId: number
 *   - programId: number
 *   - intakeApplied: string (e.g., "Spring 2026", "Fall 2026")
 * 
 * Returns: created application object
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { countryId, programId, intakeApplied } = req.body;

    // Validation
    if (!countryId || !programId || !intakeApplied) {
      return sendError(res, "Missing required fields: countryId, programId, intakeApplied", 400);
    }

    // Verify country exists
    const country = await prisma.country.findUnique({
      where: { id: parseInt(countryId) },
    });
    if (!country) {
      return sendError(res, "Country not found", 404);
    }

    // Verify program exists
    const program = await prisma.program.findUnique({
      where: { id: parseInt(programId) },
    });
    if (!program) {
      return sendError(res, "Program not found", 404);
    }

    // Get "Pending" status
    let pendingStatus = await prisma.applicationStatus.findUnique({
      where: { name: "Pending" },
    });

    if (!pendingStatus) {
      // Create if it doesn't exist
      pendingStatus = await prisma.applicationStatus.create({
        data: { name: "Pending" },
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: req.auth.userId,
        countryId: parseInt(countryId),
        programId: parseInt(programId),
        statusId: pendingStatus.id,
        intakeApplied,
      },
      include: {
        country: true,
        program: { include: { university: { include: { country: true } } } },
        status: true,
      },
    });

    return sendSuccess(res, application, 201);
  } catch (error) {
    console.error("[Create Application Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/applications
 * Get all applications for authenticated user
 * 
 * Query:
 *   - status: string (optional, filter by status name)
 * 
 * Returns: array of applications
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = { userId: req.auth.userId };

    // Filter by status if provided
    if (status) {
      const statusRecord = await prisma.applicationStatus.findUnique({
        where: { name: status },
      });
      if (statusRecord) {
        whereClause.statusId = statusRecord.id;
      }
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        country: true,
        program: { include: { university: true } },
        status: true,
        visaOutcome: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, applications);
  } catch (error) {
    console.error("[Get Applications Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/applications/:id
 * Get specific application details
 * 
 * Params:
 *   - id: application ID
 * 
 * Returns: application object with relations
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        country: true,
        program: { include: { university: true } },
        status: true,
        visaOutcome: true,
      },
    });

    if (!application) {
      return sendError(res, "Application not found", 404);
    }

    // Verify ownership (user can only see their own applications)
    if (application.userId !== req.auth.userId) {
      return sendError(res, "Forbidden", 403);
    }

    return sendSuccess(res, application);
  } catch (error) {
    console.error("[Get Application Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/applications/:id/visa-outcome
 * Get visa outcome for a specific application
 * 
 * Params:
 *   - id: application ID
 * 
 * Returns: visa outcome object or null if not yet decided
 */
router.get("/:id/visa-outcome", requireAuth, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    // Verify application exists and belongs to user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return sendError(res, "Application not found", 404);
    }

    if (application.userId !== req.auth.userId) {
      return sendError(res, "Forbidden", 403);
    }

    // Get visa outcome
    const visaOutcome = await prisma.visaOutcome.findUnique({
      where: { applicationId },
    });

    if (!visaOutcome) {
      return sendSuccess(res, null);
    }

    return sendSuccess(res, visaOutcome);
  } catch (error) {
    console.error("[Get Visa Outcome Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

module.exports = router;
