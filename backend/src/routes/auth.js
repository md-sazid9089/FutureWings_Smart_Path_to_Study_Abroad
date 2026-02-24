/**
 * Auth Routes
 * 
 * POST /api/auth/signup  - Create new user account
 * POST /api/auth/login   - Authenticate user and return JWT
 */

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const { sendSuccess, sendError } = require("../middleware/response");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

/**
 * POST /api/auth/signup
 * Create new user account
 * 
 * Body:
 *   - email: string (will be lowercased and trimmed)
 *   - password: string (will be hashed with bcrypt)
 *   - fullname: string (optional)
 * 
 * Returns: { token, user: { id, email, role } }
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullname } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return sendError(res, "Email already registered", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullname: fullname || null,
        role: "USER",
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          fullname: newUser.fullname,
        },
      },
      201
    );
  } catch (error) {
    console.error("[Auth Signup Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 * 
 * Body:
 *   - email: string
 *   - password: string
 * 
 * Returns: { token, user: { id, email, role, fullname } }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendError(res, "Invalid email or password", 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
      },
    });
  } catch (error) {
    console.error("[Auth Login Error]", error);
    return sendError(res, "Internal server error", 500);
  }
});

module.exports = router;
