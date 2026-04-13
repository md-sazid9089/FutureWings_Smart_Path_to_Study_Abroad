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
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ""))
  : ["http://localhost:3000"];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // allow predefined origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // allow Vercel preview environments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Return error for non-matching origins
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Stripe webhook endpoint must be BEFORE JSON parsing for raw body
// This is a workaround: we'll handle it within the payments route with conditional parsing
// Better approach: use the middleware inside the route

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

// ─── Entry Point ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "FutureWings API is Live",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// ─── Routes ─────────────────────────────────────────────
// Using Prisma-integrated routes from src/routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/notifications", require("./src/routes/notifications"));
app.use("/api/payments", require("./src/routes/payments"));
app.use("/api/payments", require("./src/routes/inlinePayment"));
app.use("/api/consultancy", require("./src/routes/consultancy"));
app.use("/api/applications", require("./src/routes/applications"));
// Note: visa-outcomes should be combined or used as a sub-route. 
// Moving it here to ensure it doesn't conflict.
app.use("/api/applications", require("./src/routes/visa-outcomes"));
app.use("/api/countries", require("./src/routes/countries"));
app.use("/api/ratings", require("./src/routes/ratings"));
app.use("/api/recommendations", require("./src/routes/recommendations"));
app.use("/api/documents", require("./src/routes/documents"));
app.use("/api/scholarships", require("./src/routes/scholarships"));
app.use("/api/universities", require("./src/routes/universities"));
app.use("/api/ai-assistant", require("./src/routes/ai-assistant"));
app.use("/api/admin", require("./src/routes/admin"));

// Route moved up to consolidate applications endpoints

// ─── Health check ───────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    // Test database connection with a real count to ensure tables exist
    const userCount = await prisma.user.count();
    res.json({ 
      status: "ok", 
      database: "connected", 
      userCount,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(503).json({ 
      status: "error", 
      database: "disconnected", 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
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
