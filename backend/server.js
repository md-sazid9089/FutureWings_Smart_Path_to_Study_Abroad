const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize Prisma Client
const prisma = require("./src/prisma/client");

const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
app.use("/api/admin", require("./src/routes/admin"));

// ─── Special route for visa outcomes ─────────────────────
// GET /api/applications/:id/visa-outcome
app.use("/api/applications", require("./src/routes/visa-outcomes"));

// ─── Health check ───────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// ─── 404 fallback ───────────────────────────────────────
app.use("/api/*", (_req, res) => res.status(404).json({ error: "Not found" }));

// ─── Error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: { message: "Internal server error" },
  });
});

// ─── Graceful shutdown ──────────────────────────────────
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// ─── Start (only when run directly, not when imported by tests) ──
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = app;
