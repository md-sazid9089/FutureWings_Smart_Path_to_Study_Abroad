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
const { isValidEmail, validatePassword, validateName, isValidGPA } = require("../utils/validation");

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 * Body: { email, password, fullName? }
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName, cgpa, degreeLevel, major, fundScore, preferredCountry } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }
    if (!isValidEmail(email)) {
      return errorResponse(res, "Invalid email format", 400);
    }
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      return errorResponse(res, pwdValidation.errors[0], 400);
    }
    if (fullName && !validateName(fullName)) {
      return errorResponse(res, "Name must not exceed 15 words", 400);
    }

    // Validate optional academic fields if provided
    if (cgpa !== undefined && cgpa !== null && cgpa !== '') {
      if (!isValidGPA(cgpa)) return errorResponse(res, 'CGPA must be a number between 0 and 4.0', 400);
    }
    if (fundScore !== undefined && fundScore !== null && fundScore !== '') {
      const n = Number(fundScore);
      if (isNaN(n) || n < 0 || n > 10) return errorResponse(res, 'Fund score must be a number between 0 and 10', 400);
    }
    // sanitize preferredCountry
    const preferredCountryClean = typeof preferredCountry === 'string' ? preferredCountry.trim() : null;
    // degreeLevel validation (if provided) - must match allowed options
    const allowedDegreeLevels = ['Bachelors', 'Masters', 'PhD'];
    if (degreeLevel && !allowedDegreeLevels.includes(degreeLevel)) {
      return errorResponse(res, 'Invalid degree level', 400);
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
        cgpa: cgpa !== undefined && cgpa !== null && cgpa !== '' ? parseFloat(cgpa) : null,
        degreeLevel: degreeLevel || null,
        major: major || null,
        fundScore: fundScore !== undefined && fundScore !== null && fundScore !== '' ? parseInt(fundScore) : null,
        preferredCountry: preferredCountryClean || null,
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
          cgpa: user.cgpa,
          degreeLevel: user.degreeLevel,
          major: user.major,
          fundScore: user.fundScore,
          preferredCountry: user.preferredCountry,
          isPremium: false,
          premiumFeatures: [],
          premiumExpiryDate: null,
        },
      },
      "User registered successfully",
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
    if (!isValidEmail(email)) {
      return errorResponse(res, "Invalid email format", 400);
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

    // Check if premium has expired
    let isPremium = user.isPremium;
    if (isPremium && user.premiumExpiryDate && user.premiumExpiryDate < new Date()) {
      isPremium = false;
      // Reset premium status if expired
      await prisma.user.update({
        where: { id: user.id },
        data: { isPremium: false, premiumFeatures: null },
      });
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
        isPremium,
        premiumFeatures: user.premiumFeatures ? user.premiumFeatures.split(",") : [],
        premiumExpiryDate: user.premiumExpiryDate,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

module.exports = router;
