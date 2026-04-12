/**
 * Notifications Routes
 * GET /api/notifications - Get unread notifications for user
 * POST /api/notifications/:id/read - Mark notification as read
 * DELETE /api/notifications/:id - Delete a notification
 * GET /api/notifications/count - Get count of unread notifications
 */

const express = require("express");
const prisma = require("../prisma/client");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * GET /api/notifications
 * Get unread notifications for authenticated user
 * Query params: limit (default 20), offset (default 0), read (unread|all)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { limit = 20, offset = 0, read = "unread" } = req.query;

    const where = { userId };
    if (read === "unread") {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.notification.count({ where });

    return successResponse(res, {
      notifications,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return errorResponse(res, "Failed to fetch notifications", 500);
  }
});

/**
 * GET /api/notifications/count
 * Get count of unread notifications
 */
router.get("/count", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return successResponse(res, { unreadCount: count });
  } catch (error) {
    console.error("Count notifications error:", error);
    return errorResponse(res, "Failed to count notifications", 500);
  }
});

/**
 * GET /api/notifications/:id
 * Get a specific notification
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification) {
      return errorResponse(res, "Notification not found", 404);
    }

    // Verify ownership
    if (notification.userId !== userId) {
      return errorResponse(res, "Unauthorized", 403);
    }

    return successResponse(res, notification);
  } catch (error) {
    console.error("Fetch notification error:", error);
    return errorResponse(res, "Failed to fetch notification", 500);
  }
});

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
router.post("/:id/read", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;

    // Get notification first
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification) {
      return errorResponse(res, "Notification not found", 404);
    }

    // Verify ownership
    if (notification.userId !== userId) {
      return errorResponse(res, "Unauthorized", 403);
    }

    // Mark as read
    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true },
    });

    return successResponse(res, updated, "Notification marked as read");
  } catch (error) {
    console.error("Mark as read error:", error);
    return errorResponse(res, "Failed to mark notification as read", 500);
  }
});

/**
 * POST /api/notifications/mark-all-read
 * Mark all unread notifications as read
 */
router.post("/mark-all/read", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    return successResponse(res, result, `${result.count} notifications marked as read`);
  } catch (error) {
    console.error("Mark all as read error:", error);
    return errorResponse(res, "Failed to mark all notifications as read", 500);
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification) {
      return errorResponse(res, "Notification not found", 404);
    }

    // Verify ownership
    if (notification.userId !== userId) {
      return errorResponse(res, "Unauthorized", 403);
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(res, null, "Notification deleted");
  } catch (error) {
    console.error("Delete notification error:", error);
    return errorResponse(res, "Failed to delete notification", 500);
  }
});

/**
 * DELETE /api/notifications/clear/all
 * Delete all notifications for user
 */
router.delete("/clear/all", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;

    const result = await prisma.notification.deleteMany({
      where: { userId },
    });

    return successResponse(res, result, `${result.count} notifications deleted`);
  } catch (error) {
    console.error("Clear all notifications error:", error);
    return errorResponse(res, "Failed to clear notifications", 500);
  }
});

/**
 * POST /api/notifications/create (Internal use for triggering notifications)
 * Create a notification for a user (typically called internally)
 * Body: { userId, type, title, message, link? }
 */
router.post("/create", async (req, res) => {
  try {
    // This endpoint should ideally be protected with a service-to-service auth
    // For now, using basic validation
    const { userId, type, title, message, link } = req.body;

    if (!userId || !type || !title || !message) {
      return errorResponse(res, "Missing required fields", 400);
    }

    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        type,
        title,
        message,
        link: link || null,
      },
    });

    return successResponse(res, notification, "Notification created", 201);
  } catch (error) {
    console.error("Create notification error:", error);
    return errorResponse(res, "Failed to create notification", 500);
  }
});

module.exports = router;
