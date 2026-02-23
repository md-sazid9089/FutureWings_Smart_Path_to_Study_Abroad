const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

// Middleware: attach req.auth = { userId, role } or 401
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, data: null, error: "Unauthorized" });
  }
  const decoded = verifyToken(header.slice(7));
  if (!decoded) {
    return res.status(401).json({ success: false, data: null, error: "Unauthorized" });
  }
  req.auth = { userId: decoded.userId, role: decoded.role };
  next();
}

// Middleware: requireAuth + ADMIN check
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth.role !== "ADMIN") {
      return res.status(403).json({ success: false, data: null, error: "Forbidden" });
    }
    next();
  });
}

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

function err(res, message, status = 400) {
  return res.status(status).json({ success: false, data: null, error: message });
}

module.exports = { signToken, verifyToken, requireAuth, requireAdmin, ok, err };
