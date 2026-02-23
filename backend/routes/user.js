const express = require("express");
const { requireAuth, ok, err } = require("../auth");
const db = require("../store");
const router = express.Router();

// GET /api/user/me
router.get("/me", requireAuth, (req, res) => {
  const user = db.users.find((u) => u.id === req.auth.userId);
  if (!user) return err(res, "User not found", 404);
  const { password, ...rest } = user;
  return ok(res, rest);
});

// PUT /api/user/me
router.put("/me", requireAuth, (req, res) => {
  const user = db.users.find((u) => u.id === req.auth.userId);
  if (!user) return err(res, "User not found", 404);
  const { fullname, cgpa, degreeLevel, major, fundScore } = req.body || {};
  if (fullname !== undefined) user.fullname = fullname;
  if (cgpa !== undefined) user.cgpa = parseFloat(cgpa);
  if (degreeLevel !== undefined) user.degreeLevel = degreeLevel;
  if (major !== undefined) user.major = major;
  if (fundScore !== undefined) user.fundScore = parseInt(fundScore);
  const { password, ...rest } = user;
  return ok(res, rest);
});

module.exports = router;
