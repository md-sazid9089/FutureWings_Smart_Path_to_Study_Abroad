/**
 * Authentication Middleware
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

/**
 * Sign JWT token with userId and role
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware: Require authentication
 * Extracts JWT from Authorization header and attaches to req.auth
 * Returns 401 if no valid token
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { message: "Unauthorized: No token provided" },
    });
  }

  const token = header.slice(7); // Remove "Bearer " prefix
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: { message: "Unauthorized: Invalid token" },
    });
  }

  req.auth = { userId: decoded.userId, role: decoded.role };
  next();
}

module.exports = {
  signToken,
  verifyToken,
  requireAuth,
};
