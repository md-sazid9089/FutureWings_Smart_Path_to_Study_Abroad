/**
 * Documents Routes (User)
 * GET /api/documents (list user's documents)
 * POST /api/documents (upload document)
 * GET /api/documents/:id (get document details)
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * GET /api/documents
 * Get all documents for the current user
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;

    const documents = await prisma.userDocument.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        filePath: true,
        fileType: true,
        verificationStatus: true,
        adminNote: true,
        uploadedAt: true,
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
 * POST /api/documents
 * Create a new document
 * Body: { filePath, fileType? }
 * Note: In a real app, you'd handle file upload with multer and store the file
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { filePath, fileType } = req.body;

    // Validation
    if (!filePath) {
      return errorResponse(res, "filePath is required", 400);
    }

    const document = await prisma.userDocument.create({
      data: {
        userId,
        filePath,
        fileType: fileType || null,
        verificationStatus: "PENDING",
      },
    });

    return successResponse(res, document, 201);
  } catch (error) {
    console.error("Create document error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * GET /api/documents/:id
 * Get a specific document
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;
    const documentId = parseInt(id, 10);

    if (isNaN(documentId)) {
      return errorResponse(res, "Invalid document ID", 400);
    }

    const document = await prisma.userDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return errorResponse(res, "Document not found", 404);
    }

    // Check ownership
    if (document.userId !== userId) {
      return errorResponse(res, "Forbidden", 403);
    }

    return successResponse(res, document);
  } catch (error) {
    console.error("Get document error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
