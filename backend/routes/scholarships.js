const express = require("express");
const { ok } = require("../auth");
const db = require("../store");
const router = express.Router();

// GET /api/scholarships/country/:id
router.get("/country/:id", (req, res) => {
  const id = parseInt(req.params.id);
  return ok(res, db.scholarships.filter((s) => s.countryId === id));
});

module.exports = router;
