const express = require("express");
const cors = require("cors");

const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/countries", require("./routes/countries"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/recommendations", require("./routes/recommendations"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/scholarships", require("./routes/scholarships"));
app.use("/api/universities", require("./routes/universities"));
app.use("/api/admin", require("./routes/admin"));

// ─── Health check ───────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─── 404 fallback ───────────────────────────────────────
app.use("/api/*", (_req, res) => res.status(404).json({ error: "Not found" }));

// ─── Start ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

module.exports = app;
