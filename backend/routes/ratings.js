const express = require("express");
const { requireAuth, ok, err } = require("../auth");
const db = require("../store");
const router = express.Router();

// POST /api/ratings
router.post("/", requireAuth, (req, res) => {
  const { countryId, overall, visa, cost, education, lifestyle } = req.body || {};
  if (!countryId) return err(res, "countryId is required", 400);
  const rating = (overall || 5 + (visa || 5) + (cost || 5) + (education || 5) + (lifestyle || 5)) / 5;
  const existing = db.countryRatings.find((r) => r.userId === req.auth.userId && r.countryId === parseInt(countryId));
  if (existing) {
    existing.rating = Math.round(rating);
    existing.review = req.body.review || existing.review;
    return ok(res, existing);
  }
  const newRating = { id: db.nextId.rating++, userId: req.auth.userId, countryId: parseInt(countryId), rating: Math.round(rating), review: req.body.review || null, createdAt: new Date().toISOString() };
  db.countryRatings.push(newRating);
  return ok(res, newRating);
});

module.exports = router;
