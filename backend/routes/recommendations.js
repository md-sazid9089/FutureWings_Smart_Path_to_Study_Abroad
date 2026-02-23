const express = require("express");
const { requireAuth, ok } = require("../auth");
const db = require("../store");
const router = express.Router();

// GET /api/recommendations/countries
router.get("/countries", requireAuth, (req, res) => {
  const user = db.users.find((u) => u.id === req.auth.userId);
  const cgpa = user?.cgpa || 0;
  let tier;
  if (cgpa >= 3.5) tier = 1;
  else if (cgpa >= 3.0) tier = 2;
  else tier = 3;
  const matched = db.countries.filter((c) => c.isActive && c.tier <= tier);
  return ok(res, { tier, countries: matched });
});

module.exports = router;
