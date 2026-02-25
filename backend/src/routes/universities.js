/**
 * Universities Routes
 * GET /api/universities/:id/programs
 */

const express = require("express");
const prisma = require("../prisma/client");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * GET /api/universities/:id/programs
 * Get all programs in a university
 */
router.get("/:id/programs", async (req, res) => {
  try {
    const { id } = req.params;
    const universityId = parseInt(id, 10);

    if (isNaN(universityId)) {
      return errorResponse(res, "Invalid university ID", 400);
    }

    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      return errorResponse(res, "University not found", 404);
    }

    const programs = await prisma.program.findMany({
      where: { universityId },
      select: {
        id: true,
        universityId: true,
        programName: true,
        level: true,
        tuitionPerYear: true,
      },
      orderBy: { programName: "asc" },
    });

    return successResponse(res, programs);
  } catch (error) {
    console.error("Get programs error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
