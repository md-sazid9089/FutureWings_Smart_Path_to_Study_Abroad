const express = require("express");
const { signToken, requireAuth, ok, err } = require("../auth");
const db = require("../store");
const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return err(res, "Email and password are required", 400);
  const user = db.users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.password !== password) return err(res, "Invalid email or password", 401);
  const token = signToken({ userId: user.id, role: user.role });
  return ok(res, { token, user: { id: user.id, email: user.email, role: user.role, fullname: user.fullname } });
});

// POST /api/auth/signup
router.post("/signup", (req, res) => {
  const { email, password, fullname } = req.body || {};
  if (!email || !password) return err(res, "Email and password are required", 400);
  const id = db.nextId.user++;
  const normalizedEmail = email.trim().toLowerCase();
  const newUser = { id, email: normalizedEmail, password, role: "USER", fullname: fullname || null, cgpa: null, degreeLevel: null, major: null, fundScore: null };
  db.users.push(newUser);
  const token = signToken({ userId: id, role: "USER" });
  return ok(res, { token, user: { id, email: normalizedEmail, role: "USER", fullname: newUser.fullname } }, 201);
});

module.exports = router;
