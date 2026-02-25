/**
 * Authentication Routes
 * POST /api/auth/signup
 * POST /api/auth/login
 */

const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const { signToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 * Body: { email, password, fullName? }
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return errorResponse(res, "Email already registered", 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: fullName || null,
        role: "USER",
      },
    });

    // Generate JWT token
    const token = signToken({ userId: user.id, role: user.role });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      },
      201
    );
  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Generate JWT token
    const token = signToken({ userId: user.id, role: user.role });

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
