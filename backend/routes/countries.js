const express = require("express");
const { ok } = require("../auth");
const db = require("../store");
const router = express.Router();

// GET /api/countries
router.get("/", (req, res) => {
  return ok(res, db.countries.filter((c) => c.isActive));
});

// GET /api/countries/:id/ratings-summary
router.get("/:id/ratings-summary", (req, res) => {
  const id = parseInt(req.params.id);
  const ratings = db.countryRatings.filter((r) => r.countryId === id);
  const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
  return ok(res, { average: Math.round(avg * 10) / 10, count: ratings.length });
});

// GET /api/countries/:id/universities
router.get("/:id/universities", (req, res) => {
  const id = parseInt(req.params.id);
  const unis = db.universities.filter((u) => u.countryId === id).map((u) => ({ ...u, country: db.getCountry(u.countryId) }));
  return ok(res, unis);
});

module.exports = router;
