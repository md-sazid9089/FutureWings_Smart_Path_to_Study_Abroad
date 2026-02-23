const express = require("express");
const { ok } = require("../auth");
const db = require("../store");
const router = express.Router();

// GET /api/universities/:id/programs
router.get("/:id/programs", (req, res) => {
  const id = parseInt(req.params.id);
  const uni = db.getUniversity(id);
  const progs = db.programs.filter((p) => p.universityId === id).map((p) => ({ ...p, university: uni }));
  return ok(res, progs);
});

module.exports = router;
