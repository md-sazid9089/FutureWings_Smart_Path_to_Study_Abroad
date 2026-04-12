/**
 * Visa Consultancy Routes
 * Admin: POST /api/consultancy/agencies (create)
 * Admin: PUT /api/consultancy/agencies/:id (update)
 * Admin: DELETE /api/consultancy/agencies/:id (delete)
 * Users: GET /api/consultancy/agencies (list all active agencies)
 * Users: GET /api/consultancy/agencies/:id (get single agency)
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * GET /api/consultancy/agencies
 * Get all active visa consultancy agencies (public, but can be filtered by paid users)
 */
router.get("/agencies", async (req, res) => {
  try {
    const agencies = await prisma.visaConsultancy.findMany({
      where: { isActive: true },
      orderBy: { rating: "desc" },
    });

    return successResponse(res, agencies);
  } catch (error) {
    console.error("Fetch agencies error:", error);
    return errorResponse(res, "Failed to fetch agencies", 500);
  }
});

/**
 * GET /api/consultancy/agencies/:id
 * Get a specific visa consultancy agency
 */
router.get("/agencies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await prisma.visaConsultancy.findUnique({
      where: { id: parseInt(id) },
    });

    if (!agency) {
      return errorResponse(res, "Agency not found", 404);
    }

    if (!agency.isActive) {
      return errorResponse(res, "Agency is no longer active", 410);
    }

    return successResponse(res, agency);
  } catch (error) {
    console.error("Fetch agency error:", error);
    return errorResponse(res, "Failed to fetch agency", 500);
  }
});

/**
 * POST /api/consultancy/agencies
 * Create a new visa consultancy agency (ADMIN ONLY)
 * Body: { agencyName, email?, phone?, country?, city?, website?, description?, specializations? }
 */
router.post("/agencies", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      agencyName,
      email,
      phone,
      country,
      city,
      website,
      description,
      specializations,
    } = req.body;

    // Validation
    if (!agencyName || agencyName.trim().length === 0) {
      return errorResponse(res, "Agency name is required", 400);
    }

    // Create agency
    const agency = await prisma.visaConsultancy.create({
      data: {
        agencyName: agencyName.trim(),
        email: email || null,
        phone: phone || null,
        country: country || null,
        city: city || null,
        website: website || null,
        description: description || null,
        specializations: specializations || null,
        rating: 0,
        isActive: true,
      },
    });

    return successResponse(
      res,
      agency,
      "Agency created successfully",
      201
    );
  } catch (error) {
    console.error("Create agency error:", error);
    return errorResponse(res, "Failed to create agency", 500);
  }
});

/**
 * PUT /api/consultancy/agencies/:id
 * Update a visa consultancy agency (ADMIN ONLY)
 * Body: { agencyName?, email?, phone?, country?, city?, website?, description?, specializations?, rating?, isActive? }
 */
router.put("/agencies/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      agencyName,
      email,
      phone,
      country,
      city,
      website,
      description,
      specializations,
      rating,
      isActive,
    } = req.body;

    // Check if agency exists
    const agency = await prisma.visaConsultancy.findUnique({
      where: { id: parseInt(id) },
    });

    if (!agency) {
      return errorResponse(res, "Agency not found", 404);
    }

    // Prepare update data (only include provided fields)
    const updateData = {};
    if (agencyName !== undefined) updateData.agencyName = agencyName.trim();
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (country !== undefined) updateData.country = country || null;
    if (city !== undefined) updateData.city = city || null;
    if (website !== undefined) updateData.website = website || null;
    if (description !== undefined) updateData.description = description || null;
    if (specializations !== undefined) updateData.specializations = specializations || null;
    if (rating !== undefined) updateData.rating = Math.max(0, Math.min(5, parseFloat(rating)));
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, "No fields to update", 400);
    }

    // Update agency
    const updatedAgency = await prisma.visaConsultancy.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return successResponse(res, updatedAgency, "Agency updated successfully");
  } catch (error) {
    console.error("Update agency error:", error);
    return errorResponse(res, "Failed to update agency", 500);
  }
});

/**
 * DELETE /api/consultancy/agencies/:id
 * Soft delete a visa consultancy agency (ADMIN ONLY)
 * Sets isActive to false instead of removing data
 */
router.delete("/agencies/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if agency exists
    const agency = await prisma.visaConsultancy.findUnique({
      where: { id: parseInt(id) },
    });

    if (!agency) {
      return errorResponse(res, "Agency not found", 404);
    }

    // Soft delete by marking as inactive
    const deletedAgency = await prisma.visaConsultancy.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return successResponse(res, deletedAgency, "Agency deleted successfully");
  } catch (error) {
    console.error("Delete agency error:", error);
    return errorResponse(res, "Failed to delete agency", 500);
  }
});

/**
 * GET /api/consultancy/agencies-by-country/:country
 * Get visa consultancy agencies for a specific country
 */
router.get("/agencies-by-country/:country", async (req, res) => {
  try {
    const { country } = req.params;

    const agencies = await prisma.visaConsultancy.findMany({
      where: {
        isActive: true,
        specializations: {
          contains: country,
        },
      },
      orderBy: { rating: "desc" },
    });

    return successResponse(res, agencies);
  } catch (error) {
    console.error("Fetch agencies by country error:", error);
    return errorResponse(res, "Failed to fetch agencies", 500);
  }
});

/**
 * GET /api/consultancy/admin/all-agencies
 * Get all agencies including inactive ones (ADMIN ONLY)
 */
router.get("/admin/all-agencies", requireAuth, requireAdmin, async (req, res) => {
  try {
    const agencies = await prisma.visaConsultancy.findMany({
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, agencies);
  } catch (error) {
    console.error("Fetch all agencies error:", error);
    return errorResponse(res, "Failed to fetch agencies", 500);
  }
});

/**
 * POST /api/consultancy/bulk-import
 * Import multiple agencies (ADMIN ONLY)
 * Body: { agencies: [{ agencyName, email?, ... }] }
 */
router.post("/bulk-import", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { agencies } = req.body;

    if (!Array.isArray(agencies) || agencies.length === 0) {
      return errorResponse(res, "Agencies array is required and must not be empty", 400);
    }

    // Create multiple agencies
    const created = await Promise.all(
      agencies.map((agency) =>
        prisma.visaConsultancy.create({
          data: {
            agencyName: agency.agencyName.trim(),
            email: agency.email || null,
            phone: agency.phone || null,
            country: agency.country || null,
            city: agency.city || null,
            website: agency.website || null,
            description: agency.description || null,
            specializations: agency.specializations || null,
            rating: 0,
            isActive: true,
          },
        })
      )
    );

    return successResponse(
      res,
      { count: created.length, agencies: created },
      `Successfully imported ${created.length} agencies`,
      201
    );
  } catch (error) {
    console.error("Bulk import error:", error);
    return errorResponse(res, "Failed to import agencies", 500);
  }
});

module.exports = router;
