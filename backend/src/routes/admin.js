/**
 * Admin Routes
 * 
 * All routes require ADMIN role
 * 
 * Countries: CRUD
 * Universities: CRUD
 * Programs: CRUD
 * Scholarships: CRUD
 * Documents: View & verify
 * Applications: Update status & add visa outcome
 * Ratings: View all
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { sendSuccess, sendError } = require("../middleware/response");

const router = express.Router();

// ─────────────────────────────── COUNTRIES ───────────────────────────────

/**
 * POST /api/admin/countries
 * Create new country
 */
router.post("/countries", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, code, description, isActive, tier } = req.body;

    if (!name || !code) {
      return sendError(res, "Name and code are required", 400);
    }

    const country = await prisma.country.create({
      data: {
        name,
        code,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        tier: tier || 1,
      },
    });

    return sendSuccess(res, country, 201);
  } catch (error) {
    console.error("[Create Country Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/admin/countries
 * Get all countries (including inactive)
 */
router.get("/countries", requireAuth, requireAdmin, async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: "asc" },
    });
    return sendSuccess(res, countries);
  } catch (error) {
    console.error("[Get Countries Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/countries/:id
 * Update country
 */
router.put("/countries/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, code, description, isActive, tier } = req.body;
    const countryId = parseInt(req.params.id);

    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return sendError(res, "Country not found", 404);
    }

    const updated = await prisma.country.update({
      where: { id: countryId },
      data: {
        name: name !== undefined ? name : country.name,
        code: code !== undefined ? code : country.code,
        description: description !== undefined ? description : country.description,
        isActive: isActive !== undefined ? isActive : country.isActive,
        tier: tier !== undefined ? tier : country.tier,
      },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    console.error("[Update Country Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * DELETE /api/admin/countries/:id
 * Delete country
 */
router.delete("/countries/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const countryId = parseInt(req.params.id);

    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return sendError(res, "Country not found", 404);
    }

    await prisma.country.delete({
      where: { id: countryId },
    });

    return sendSuccess(res, { message: "Country deleted successfully" });
  } catch (error) {
    console.error("[Delete Country Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

// ─────────────────────────────── UNIVERSITIES ───────────────────────────────

/**
 * POST /api/admin/universities
 * Create new university
 */
router.post("/universities", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, countryId, location, ranking, website } = req.body;

    if (!name || !countryId) {
      return sendError(res, "Name and countryId are required", 400);
    }

    const country = await prisma.country.findUnique({
      where: { id: parseInt(countryId) },
    });

    if (!country) {
      return sendError(res, "Country not found", 404);
    }

    const university = await prisma.university.create({
      data: {
        name,
        countryId: parseInt(countryId),
        location: location || null,
        ranking: ranking || null,
        website: website || null,
      },
    });

    return sendSuccess(res, university, 201);
  } catch (error) {
    console.error("[Create University Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/admin/universities
 * Get all universities
 */
router.get("/universities", requireAuth, requireAdmin, async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      include: { country: true },
    });
    return sendSuccess(res, universities);
  } catch (error) {
    console.error("[Get Universities Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/universities/:id
 * Update university
 */
router.put("/universities/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, countryId, location, ranking, website } = req.body;
    const universityId = parseInt(req.params.id);

    const university = await prisma.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      return sendError(res, "University not found", 404);
    }

    if (countryId) {
      const country = await prisma.country.findUnique({
        where: { id: parseInt(countryId) },
      });
      if (!country) {
        return sendError(res, "Country not found", 404);
      }
    }

    const updated = await prisma.university.update({
      where: { id: universityId },
      data: {
        name: name !== undefined ? name : university.name,
        countryId: countryId !== undefined ? parseInt(countryId) : university.countryId,
        location: location !== undefined ? location : university.location,
        ranking: ranking !== undefined ? ranking : university.ranking,
        website: website !== undefined ? website : university.website,
      },
      include: { country: true },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    console.error("[Update University Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * DELETE /api/admin/universities/:id
 * Delete university
 */
router.delete("/universities/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const universityId = parseInt(req.params.id);

    const university = await prisma.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      return sendError(res, "University not found", 404);
    }

    await prisma.university.delete({
      where: { id: universityId },
    });

    return sendSuccess(res, { message: "University deleted successfully" });
  } catch (error) {
    console.error("[Delete University Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

// ─────────────────────────────── PROGRAMS ───────────────────────────────

/**
 * POST /api/admin/programs
 * Create new program
 */
router.post("/programs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, universityId, degreeLevel, duration, tuitionFee, description } = req.body;

    if (!name || !universityId || !degreeLevel) {
      return sendError(res, "Name, universityId, and degreeLevel are required", 400);
    }

    const university = await prisma.university.findUnique({
      where: { id: parseInt(universityId) },
    });

    if (!university) {
      return sendError(res, "University not found", 404);
    }

    const program = await prisma.program.create({
      data: {
        name,
        universityId: parseInt(universityId),
        degreeLevel,
        duration: duration || null,
        tuitionFee: tuitionFee || null,
        description: description || null,
      },
    });

    return sendSuccess(res, program, 201);
  } catch (error) {
    console.error("[Create Program Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/admin/programs
 * Get all programs
 */
router.get("/programs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      include: { university: { include: { country: true } } },
    });
    return sendSuccess(res, programs);
  } catch (error) {
    console.error("[Get Programs Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/programs/:id
 * Update program
 */
router.put("/programs/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, universityId, degreeLevel, duration, tuitionFee, description } = req.body;
    const programId = parseInt(req.params.id);

    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return sendError(res, "Program not found", 404);
    }

    if (universityId) {
      const university = await prisma.university.findUnique({
        where: { id: parseInt(universityId) },
      });
      if (!university) {
        return sendError(res, "University not found", 404);
      }
    }

    const updated = await prisma.program.update({
      where: { id: programId },
      data: {
        name: name !== undefined ? name : program.name,
        universityId: universityId !== undefined ? parseInt(universityId) : program.universityId,
        degreeLevel: degreeLevel !== undefined ? degreeLevel : program.degreeLevel,
        duration: duration !== undefined ? duration : program.duration,
        tuitionFee: tuitionFee !== undefined ? tuitionFee : program.tuitionFee,
        description: description !== undefined ? description : program.description,
      },
      include: { university: { include: { country: true } } },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    console.error("[Update Program Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * DELETE /api/admin/programs/:id
 * Delete program
 */
router.delete("/programs/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const programId = parseInt(req.params.id);

    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return sendError(res, "Program not found", 404);
    }

    await prisma.program.delete({
      where: { id: programId },
    });

    return sendSuccess(res, { message: "Program deleted successfully" });
  } catch (error) {
    console.error("[Delete Program Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

// ─────────────────────────────── SCHOLARSHIPS ───────────────────────────────

/**
 * POST /api/admin/scholarships
 * Create new scholarship
 */
router.post("/scholarships", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, countryId, amount, eligibility, deadline } = req.body;

    if (!name || !countryId) {
      return sendError(res, "Name and countryId are required", 400);
    }

    const country = await prisma.country.findUnique({
      where: { id: parseInt(countryId) },
    });

    if (!country) {
      return sendError(res, "Country not found", 404);
    }

    const scholarship = await prisma.scholarship.create({
      data: {
        name,
        countryId: parseInt(countryId),
        amount: amount || null,
        eligibility: eligibility || null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return sendSuccess(res, scholarship, 201);
  } catch (error) {
    console.error("[Create Scholarship Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * GET /api/admin/scholarships
 * Get all scholarships
 */
router.get("/scholarships", requireAuth, requireAdmin, async (req, res) => {
  try {
    const scholarships = await prisma.scholarship.findMany({
      include: { country: true },
    });
    return sendSuccess(res, scholarships);
  } catch (error) {
    console.error("[Get Scholarships Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/scholarships/:id
 * Update scholarship
 */
router.put("/scholarships/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, countryId, amount, eligibility, deadline } = req.body;
    const scholarshipId = parseInt(req.params.id);

    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship) {
      return sendError(res, "Scholarship not found", 404);
    }

    if (countryId) {
      const country = await prisma.country.findUnique({
        where: { id: parseInt(countryId) },
      });
      if (!country) {
        return sendError(res, "Country not found", 404);
      }
    }

    const updated = await prisma.scholarship.update({
      where: { id: scholarshipId },
      data: {
        name: name !== undefined ? name : scholarship.name,
        countryId: countryId !== undefined ? parseInt(countryId) : scholarship.countryId,
        amount: amount !== undefined ? amount : scholarship.amount,
        eligibility: eligibility !== undefined ? eligibility : scholarship.eligibility,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : scholarship.deadline,
      },
      include: { country: true },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    console.error("[Update Scholarship Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * DELETE /api/admin/scholarships/:id
 * Delete scholarship
 */
router.delete("/scholarships/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const scholarshipId = parseInt(req.params.id);

    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });

    if (!scholarship) {
      return sendError(res, "Scholarship not found", 404);
    }

    await prisma.scholarship.delete({
      where: { id: scholarshipId },
    });

    return sendSuccess(res, { message: "Scholarship deleted successfully" });
  } catch (error) {
    console.error("[Delete Scholarship Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

// ─────────────────────────────── DOCUMENTS ───────────────────────────────

/**
 * GET /api/admin/documents
 * Get user documents with optional status filter
 * 
 * Query:
 *   - status: "Pending" | "Verified" | "Rejected"
 */
router.get("/documents", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const documents = await prisma.userDocument.findMany({
      where: whereClause,
      include: { user: { select: { id: true, email: true, fullname: true } } },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, documents);
  } catch (error) {
    console.error("[Get Documents Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * PUT /api/admin/documents/:docId/verify
 * Verify or reject a document
 * 
 * Body:
 *   - status: "Verified" | "Rejected"
 *   - note: string (optional)
 */
router.put("/documents/:docId/verify", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const docId = parseInt(req.params.docId);

    if (!status || !["Verified", "Rejected"].includes(status)) {
      return sendError(res, "Status must be 'Verified' or 'Rejected'", 400);
    }

    const document = await prisma.userDocument.findUnique({
      where: { id: docId },
    });

    if (!document) {
      return sendError(res, "Document not found", 404);
    }

    const updated = await prisma.userDocument.update({
      where: { id: docId },
      data: {
        status,
        note: note || null,
      },
      include: { user: { select: { id: true, email: true, fullname: true } } },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    console.error("[Verify Document Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

// ─────────────────────────────── APPLICATIONS ───────────────────────────────

/**
 * PUT /api/admin/applications/:id/status
 * Update application status
 * 
 * Body:
 *   - statusName: string ("Pending", "Approved", "Rejected", etc.)
 */
router.put("/applications/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { statusName } = req.body;
    const applicationId = parseInt(req.params.id);

    if (!statusName) {
      return sendError(res, "statusName is required", 400);
    }

    // Get or create status
    let applicationStatus = await prisma.applicationStatus.findUnique({
      where: { name: statusName },
    });

    if (!applicationStatus) {
      applicationStatus = await prisma.applicationStatus.create({
        data: { name: statusName },
      });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return sendError(res, "Application not found", 404);
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { statusId: applicationStatus.id },
      include: {
        user: true,
        country: true,
        program: { include: { university: true } },
        status: true,
        visaOutcome: true,
      },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    console.error("[Update Application Status Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * POST /api/admin/applications/:id/visa-outcome
 * Add visa outcome for an application
 * 
 * Body:
 *   - outcome: "Approved" | "Denied"
 *   - note: string (optional)
 */
router.post("/applications/:id/visa-outcome", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { outcome, note } = req.body;
    const applicationId = parseInt(req.params.id);

    if (!outcome || !["Approved", "Denied"].includes(outcome)) {
      return sendError(res, "Outcome must be 'Approved' or 'Denied'", 400);
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return sendError(res, "Application not found", 404);
    }

    // Check if visa outcome already exists
    const existingOutcome = await prisma.visaOutcome.findUnique({
      where: { applicationId },
    });

    if (existingOutcome) {
      // Update existing visa outcome
      const updated = await prisma.visaOutcome.update({
        where: { applicationId },
        data: {
          outcome,
          note: note || null,
        },
      });
      return sendSuccess(res, updated);
    }

    // Create new visa outcome
    const visaOutcome = await prisma.visaOutcome.create({
      data: {
        applicationId,
        outcome,
        note: note || null,
      },
    });

    return sendSuccess(res, visaOutcome, 201);
  } catch (error) {
    console.error("[Create Visa Outcome Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

// ─────────────────────────────── RATINGS ───────────────────────────────

/**
 * GET /api/admin/ratings
 * Get all ratings with optional filtering
 * 
 * Query:
 *   - countryId: number (optional)
 *   - userId: number (optional)
 */
router.get("/ratings", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { countryId, userId } = req.query;

    const whereClause = {};
    if (countryId) {
      whereClause.countryId = parseInt(countryId);
    }
    if (userId) {
      whereClause.userId = parseInt(userId);
    }

    const ratings = await prisma.countryRating.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, email: true, fullname: true } },
        country: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, ratings);
  } catch (error) {
    console.error("[Get Ratings Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

module.exports = router;
