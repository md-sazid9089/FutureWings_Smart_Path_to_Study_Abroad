/**
 * Main Server File (Example)
 * 
 * This shows how to integrate all Prisma-based routes with Express
 * 
 * Setup:
 * 1. npm install (to install new dependencies: @prisma/client, bcrypt)
 * 2. Update your .env file with DATABASE_URL and JWT_SECRET
 * 3. Run prisma migrations: npx prisma migrate dev
 * 4. Start server: npm run dev
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ─── Import Routes ────────────────────────────────────
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const recommendationRoutes = require("./src/routes/recommendations");
const countriesRoutes = require("./src/routes/countries");
const applicationsRoutes = require("./src/routes/applications");
const ratingsRoutes = require("./src/routes/ratings");
const adminRoutes = require("./src/routes/admin");

// ─── Initialize Express ────────────────────────────────
const app = express();

// ─── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// ─── API Routes ────────────────────────────────────────

// Auth routes (no auth required)
app.use("/api/auth", authRoutes);

// User routes (auth required)
app.use("/api/user", userRoutes);

// Recommendation routes (auth required)
app.use("/api/recommendations", recommendationRoutes);

// Browse routes (some public, some auth)
// GET /api/countries                              - public
// GET /api/countries/:id/universities             - public
// GET /api/universities/:id/programs              - public
// GET /api/scholarships/country/:id               - public
app.use("/api", countriesRoutes);

// Application routes (auth required)
app.use("/api/applications", applicationsRoutes);

// Rating routes (mixed access)
app.use("/api/ratings", ratingsRoutes);

// Admin routes (admin auth required)
app.use("/api/admin", adminRoutes);

// ─── Error Handling ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Error]", err);
  res.status(500).json({
    success: false,
    data: null,
    error: { message: "Internal server error" },
  });
});

// ─── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { message: "Route not found" },
  });
});

// ─── Start Server ──────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Database: ${process.env.DATABASE_URL}`);
});

module.exports = app;
