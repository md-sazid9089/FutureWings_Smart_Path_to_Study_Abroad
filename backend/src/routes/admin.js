/**
 * Admin Routes
 * CRUD: Countries, Universities, Programs, Scholarships
 * Document verification, Application status, Visa outcome, Ratings
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAdmin } = require("../middleware/admin");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

// ───────────────────────────────────────────────────────────
// COUNTRIES CRUD
// ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/countries
 * Get all countries
 */
router.get("/countries", requireAdmin, async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
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
 * POST /api/admin/countries
 * Create a new country
 * Body: { countryName, region?, currency?, tierLevel? }
 */
router.post("/countries", requireAdmin, async (req, res) => {
  try {
    const { countryName, region, currency, tierLevel } = req.body;

    if (!countryName) {
      return errorResponse(res, "countryName is required", 400);
    }

    const country = await prisma.country.create({
      data: {
        countryName,
        region: region || null,
        currency: currency || null,
        tierLevel: tierLevel || 3,
        isActive: true,
      },
    });

    return successResponse(res, country, 201);
  } catch (error) {
    console.error("Create country error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/countries/:id
 * Update a country
 */
router.put("/countries/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const countryId = parseInt(id, 10);

    if (isNaN(countryId)) {
      return errorResponse(res, "Invalid country ID", 400);
    }

    const { countryName, region, currency, tierLevel, isActive } = req.body;

    const updateData = {};
    if (countryName !== undefined) updateData.countryName = countryName;
    if (region !== undefined) updateData.region = region;
    if (currency !== undefined) updateData.currency = currency;
    if (tierLevel !== undefined) updateData.tierLevel = tierLevel;
    if (isActive !== undefined) updateData.isActive = isActive;

    const country = await prisma.country.update({
      where: { id: countryId },
      data: updateData,
    });

    return successResponse(res, country);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Country not found", 404);
    }
    console.error("Update country error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * DELETE /api/admin/countries/:id
 * Delete a country
 */
router.delete("/countries/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const countryId = parseInt(id, 10);

    if (isNaN(countryId)) {
      return errorResponse(res, "Invalid country ID", 400);
    }

    await prisma.country.delete({
      where: { id: countryId },
    });

    return successResponse(res, { id: countryId });
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Country not found", 404);
    }
    console.error("Delete country error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

// ───────────────────────────────────────────────────────────
// UNIVERSITIES CRUD
// ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/universities
 * Get all universities
 */
router.get("/universities", requireAdmin, async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      include: {
        country: { select: { id: true, countryName: true } },
      },
      orderBy: { universityName: "asc" },
    });

    return successResponse(res, universities);
  } catch (error) {
    console.error("Get universities error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * POST /api/admin/universities
 * Create a new university
 * Body: { countryId, universityName, type?, city? }
 */
router.post("/universities", requireAdmin, async (req, res) => {
  try {
    const { countryId, universityName, type, city } = req.body;

    if (!countryId || !universityName) {
      return errorResponse(
        res,
        "countryId and universityName are required",
        400
      );
    }

    const countryIdNum = parseInt(countryId, 10);

    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { id: countryIdNum },
    });

    if (!country) {
      return errorResponse(res, "Country not found", 404);
    }

    const university = await prisma.university.create({
      data: {
        countryId: countryIdNum,
        universityName,
        type: type || null,
        city: city || null,
      },
      include: {
        country: { select: { id: true, countryName: true } },
      },
    });

    return successResponse(res, university, 201);
  } catch (error) {
    console.error("Create university error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/universities/:id
 * Update a university
 */
router.put("/universities/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const universityId = parseInt(id, 10);

    if (isNaN(universityId)) {
      return errorResponse(res, "Invalid university ID", 400);
    }

    const { universityName, type, city } = req.body;

    const updateData = {};
    if (universityName !== undefined) updateData.universityName = universityName;
    if (type !== undefined) updateData.type = type;
    if (city !== undefined) updateData.city = city;

    const university = await prisma.university.update({
      where: { id: universityId },
      data: updateData,
      include: {
        country: { select: { id: true, countryName: true } },
      },
    });

    return successResponse(res, university);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "University not found", 404);
    }
    console.error("Update university error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * DELETE /api/admin/universities/:id
 * Delete a university
 */
router.delete("/universities/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const universityId = parseInt(id, 10);

    if (isNaN(universityId)) {
      return errorResponse(res, "Invalid university ID", 400);
    }

    await prisma.university.delete({
      where: { id: universityId },
    });

    return successResponse(res, { id: universityId });
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "University not found", 404);
    }
    console.error("Delete university error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

// ───────────────────────────────────────────────────────────
// PROGRAMS CRUD
// ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/programs
 * Get all programs
 */
router.get("/programs", requireAdmin, async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      include: {
        university: {
          select: { id: true, universityName: true, countryId: true },
        },
      },
      orderBy: { programName: "asc" },
    });

    return successResponse(res, programs);
  } catch (error) {
    console.error("Get programs error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * POST /api/admin/programs
 * Create a new program
 * Body: { universityId, programName, level?, tuitionPerYear? }
 */
router.post("/programs", requireAdmin, async (req, res) => {
  try {
    const { universityId, programName, level, tuitionPerYear } = req.body;

    if (!universityId || !programName) {
      return errorResponse(
        res,
        "universityId and programName are required",
        400
      );
    }

    const universityIdNum = parseInt(universityId, 10);

    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id: universityIdNum },
    });

    if (!university) {
      return errorResponse(res, "University not found", 404);
    }

    const program = await prisma.program.create({
      data: {
        universityId: universityIdNum,
        programName,
        level: level || null,
        tuitionPerYear: tuitionPerYear || null,
      },
      include: {
        university: {
          select: { id: true, universityName: true, countryId: true },
        },
      },
    });

    return successResponse(res, program, 201);
  } catch (error) {
    console.error("Create program error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/programs/:id
 * Update a program
 */
router.put("/programs/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const programId = parseInt(id, 10);

    if (isNaN(programId)) {
      return errorResponse(res, "Invalid program ID", 400);
    }

    const { programName, level, tuitionPerYear } = req.body;

    const updateData = {};
    if (programName !== undefined) updateData.programName = programName;
    if (level !== undefined) updateData.level = level;
    if (tuitionPerYear !== undefined) updateData.tuitionPerYear = tuitionPerYear;

    const program = await prisma.program.update({
      where: { id: programId },
      data: updateData,
      include: {
        university: {
          select: { id: true, universityName: true, countryId: true },
        },
      },
    });

    return successResponse(res, program);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Program not found", 404);
    }
    console.error("Update program error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * DELETE /api/admin/programs/:id
 * Delete a program
 */
router.delete("/programs/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const programId = parseInt(id, 10);

    if (isNaN(programId)) {
      return errorResponse(res, "Invalid program ID", 400);
    }

    await prisma.program.delete({
      where: { id: programId },
    });

    return successResponse(res, { id: programId });
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Program not found", 404);
    }
    console.error("Delete program error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

// ───────────────────────────────────────────────────────────
// SCHOLARSHIPS CRUD
// ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/scholarships
 * Get all scholarships
 */
router.get("/scholarships", requireAdmin, async (req, res) => {
  try {
    const scholarships = await prisma.scholarship.findMany({
      include: {
        country: { select: { id: true, countryName: true } },
      },
      orderBy: { deadline: "desc" },
    });

    return successResponse(res, scholarships);
  } catch (error) {
    console.error("Get scholarships error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * POST /api/admin/scholarships
 * Create a new scholarship
 * Body: { countryId, scholarshipName, eligibilityCriteria?, applyLink?, deadline?, amount? }
 */
router.post("/scholarships", requireAdmin, async (req, res) => {
  try {
    const {
      countryId,
      scholarshipName,
      eligibilityCriteria,
      applyLink,
      deadline,
      amount,
    } = req.body;

    if (!countryId || !scholarshipName) {
      return errorResponse(
        res,
        "countryId and scholarshipName are required",
        400
      );
    }

    const countryIdNum = parseInt(countryId, 10);

    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { id: countryIdNum },
    });

    if (!country) {
      return errorResponse(res, "Country not found", 404);
    }

    const scholarship = await prisma.scholarship.create({
      data: {
        countryId: countryIdNum,
        scholarshipName,
        eligibilityCriteria: eligibilityCriteria || null,
        applyLink: applyLink || null,
        deadline: deadline ? new Date(deadline) : null,
        amount: amount || null,
      },
      include: {
        country: { select: { id: true, countryName: true } },
      },
    });

    return successResponse(res, scholarship, 201);
  } catch (error) {
    console.error("Create scholarship error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/scholarships/:id
 * Update a scholarship
 */
router.put("/scholarships/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const scholarshipId = parseInt(id, 10);

    if (isNaN(scholarshipId)) {
      return errorResponse(res, "Invalid scholarship ID", 400);
    }

    const {
      scholarshipName,
      eligibilityCriteria,
      applyLink,
      deadline,
      amount,
    } = req.body;

    const updateData = {};
    if (scholarshipName !== undefined) updateData.scholarshipName = scholarshipName;
    if (eligibilityCriteria !== undefined)
      updateData.eligibilityCriteria = eligibilityCriteria;
    if (applyLink !== undefined) updateData.applyLink = applyLink;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (amount !== undefined) updateData.amount = amount;

    const scholarship = await prisma.scholarship.update({
      where: { id: scholarshipId },
      data: updateData,
      include: {
        country: { select: { id: true, countryName: true } },
      },
    });

    return successResponse(res, scholarship);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Scholarship not found", 404);
    }
    console.error("Update scholarship error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * DELETE /api/admin/scholarships/:id
 * Delete a scholarship
 */
router.delete("/scholarships/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const scholarshipId = parseInt(id, 10);

    if (isNaN(scholarshipId)) {
      return errorResponse(res, "Invalid scholarship ID", 400);
    }

    await prisma.scholarship.delete({
      where: { id: scholarshipId },
    });

    return successResponse(res, { id: scholarshipId });
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Scholarship not found", 404);
    }
    console.error("Delete scholarship error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

// ───────────────────────────────────────────────────────────
// DOCUMENTS MANAGEMENT
// ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/documents?status=PENDING
 * Get documents with optional status filter
 */
router.get("/documents", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    const where = status ? { verificationStatus: status } : {};

    const documents = await prisma.userDocument.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    return successResponse(res, documents);
  } catch (error) {
    console.error("Get documents error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/documents/:docId/verify
 * Verify a document
 * Body: { verificationStatus, adminNote? }
 * verificationStatus: VERIFIED | REJECTED
 */
router.put("/documents/:docId/verify", requireAdmin, async (req, res) => {
  try {
    const { docId } = req.params;
    const documentId = parseInt(docId, 10);
    const { verificationStatus, adminNote } = req.body;

    if (isNaN(documentId)) {
      return errorResponse(res, "Invalid document ID", 400);
    }

    if (!verificationStatus) {
      return errorResponse(res, "verificationStatus is required", 400);
    }

    if (!["VERIFIED", "REJECTED"].includes(verificationStatus)) {
      return errorResponse(
        res,
        "verificationStatus must be VERIFIED or REJECTED",
        400
      );
    }

    const document = await prisma.userDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus,
        adminNote: adminNote || null,
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    return successResponse(res, document);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Document not found", 404);
    }
    console.error("Verify document error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

// ───────────────────────────────────────────────────────────
// APPLICATIONS MANAGEMENT
// ───────────────────────────────────────────────────────────

/**
 * PUT /api/admin/applications/:id/status
 * Update application status
 * Body: { statusName } (e.g., "Accepted", "Rejected", "Pending")
 */
router.put("/applications/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { statusName } = req.body;
    const applicationId = parseInt(id, 10);

    if (isNaN(applicationId)) {
      return errorResponse(res, "Invalid application ID", 400);
    }

    if (!statusName) {
      return errorResponse(res, "statusName is required", 400);
    }

    // Get or create status
    let status = await prisma.applicationStatus.findUnique({
      where: { statusName },
    });

    if (!status) {
      status = await prisma.applicationStatus.create({
        data: { statusName },
      });
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { statusId: status.id },
      include: {
        country: { select: { id: true, countryName: true } },
        program: { select: { id: true, programName: true } },
        status: { select: { id: true, statusName: true } },
        visaOutcome: true,
      },
    });

    return successResponse(res, application);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Application not found", 404);
    }
    console.error("Update application status error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * POST /api/admin/applications/:id/visa-outcome
 * Create or update visa outcome
 * Body: { decision, reasonTitle?, notes?, destinationDate? }
 * decision: APPROVED | DENIED
 */
router.post("/applications/:id/visa-outcome", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reasonTitle, notes, destinationDate } = req.body;
    const applicationId = parseInt(id, 10);

    if (isNaN(applicationId)) {
      return errorResponse(res, "Invalid application ID", 400);
    }

    if (!decision) {
      return errorResponse(res, "decision is required", 400);
    }

    if (!["APPROVED", "DENIED"].includes(decision)) {
      return errorResponse(
        res,
        "decision must be APPROVED or DENIED",
        400
      );
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return errorResponse(res, "Application not found", 404);
    }

    // Check if visa outcome already exists
    const existingOutcome = await prisma.visaOutcome.findUnique({
      where: { applicationId },
    });

    let visaOutcome;

    if (existingOutcome) {
      // Update existing
      visaOutcome = await prisma.visaOutcome.update({
        where: { applicationId },
        data: {
          decision,
          reasonTitle: reasonTitle || null,
          notes: notes || null,
          destinationDate: destinationDate ? new Date(destinationDate) : null,
        },
      });
    } else {
      // Create new
      visaOutcome = await prisma.visaOutcome.create({
        data: {
          applicationId,
          decision,
          reasonTitle: reasonTitle || null,
          notes: notes || null,
          destinationDate: destinationDate ? new Date(destinationDate) : null,
        },
      });
    }

    return successResponse(res, visaOutcome, existingOutcome ? 200 : 201);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Application not found", 404);
    }
    console.error("Create visa outcome error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

// ───────────────────────────────────────────────────────────
// RATINGS MANAGEMENT
// ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/ratings
 * Get all ratings with optional filters
 */
router.get("/ratings", requireAdmin, async (req, res) => {
  try {
    const { countryId, userId } = req.query;

    const where = {};
    if (countryId) where.countryId = parseInt(countryId, 10);
    if (userId) where.userId = parseInt(userId, 10);

    const ratings = await prisma.countryRating.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        country: { select: { id: true, countryName: true } },
        application: {
          select: { id: true, appliedDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, ratings);
  } catch (error) {
    console.error("Get ratings error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
