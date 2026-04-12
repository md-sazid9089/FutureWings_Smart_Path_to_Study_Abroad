const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Initialize Prisma Client
const prisma = require("./src/prisma/client");

// Import error handling middleware
const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");

const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Parse JSON and URL-encoded bodies with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ─────────────────────────────────────────────
// Using Prisma-integrated routes from src/routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/applications", require("./src/routes/applications"));
app.use("/api/countries", require("./src/routes/countries"));
app.use("/api/ratings", require("./src/routes/ratings"));
app.use("/api/recommendations", require("./src/routes/recommendations"));
app.use("/api/documents", require("./src/routes/documents"));
app.use("/api/scholarships", require("./src/routes/scholarships"));
app.use("/api/universities", require("./src/routes/universities"));
app.use("/api/ai-assistant", require("./src/routes/ai-assistant"));
app.use("/api/admin", require("./src/routes/admin"));

// ─── Special route for visa outcomes ─────────────────────
// GET /api/applications/:id/visa-outcome
app.use("/api/applications", require("./src/routes/visa-outcomes"));

// ─── Health check ───────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(503).json({ status: "error", database: "disconnected", timestamp: new Date().toISOString() });
  }
});

// ─── 404 and catch-all handlers ──────────────────────────
app.use("/api/*", notFoundHandler);
app.use("*", notFoundHandler);

// ─── Global Error Handler (must be last) ────────────────
app.use(errorHandler);

// ─── Graceful shutdown ──────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// ─── Start ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Backend running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}\n`);
});

module.exports = app;
