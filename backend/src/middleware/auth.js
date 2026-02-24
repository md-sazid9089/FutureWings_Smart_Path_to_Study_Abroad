/**
 * Authentication Middleware
 * 
 * Verifies JWT token and attaches user data to request.
 * Sets req.auth = { userId, role }
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware: Verify JWT token
 * Attaches req.auth = { userId, role }
 * Returns 401 if invalid/missing
 */
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { message: "Unauthorized - Missing or invalid token" },
    });
  }

  const token = header.slice(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: { message: "Unauthorized - Invalid token" },
    });
  }

  req.auth = { userId: decoded.userId, role: decoded.role };
  next();
};

module.exports = { requireAuth, verifyToken, JWT_SECRET };
