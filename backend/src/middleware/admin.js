/**
 * Admin Authorization Middleware
 * 
 * Checks if user has ADMIN role.
 * Must be used AFTER requireAuth middleware.
 */

/**
 * Middleware: Verify user has ADMIN role
 * Returns 403 if not admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.auth || req.auth.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: { message: "Forbidden - Admin access required" },
    });
  }
  next();
};

module.exports = { requireAdmin };
