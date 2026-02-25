/**
 * Admin Middleware
 * Requires authentication + ADMIN role
 */

const { requireAuth } = require("./auth");

/**
 * Middleware: Require ADMIN role
 * Must be used AFTER requireAuth middleware
 */
function requireAdmin(req, res, next) {
  // First verify auth by calling requireAuth, then check role
  requireAuth(req, res, () => {
    if (req.auth.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: { message: "Forbidden: Admin access required" },
      });
    }
    next();
  });
}

module.exports = {
  requireAdmin,
};
