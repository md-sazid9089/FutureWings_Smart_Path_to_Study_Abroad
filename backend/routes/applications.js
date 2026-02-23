const express = require("express");
const { requireAuth, ok, err } = require("../auth");
const db = require("../store");
const router = express.Router();

// GET /api/applications
router.get("/", requireAuth, (req, res) => {
  const apps = db.applications
    .filter((a) => a.userId === req.auth.userId)
    .map((a) => {
      const status = db.getStatus(a.statusId);
      const program = db.getProgram(a.programId);
      const university = program ? db.getUniversity(program.universityId) : null;
      const country = university ? db.getCountry(university.countryId) : null;
      return { ...a, status, program: program ? { ...program, university: university ? { ...university, country } : null } : null };
    });
  return ok(res, apps);
});

// POST /api/applications
router.post("/", requireAuth, (req, res) => {
  const { programId } = req.body || {};
  if (!programId) return err(res, "programId is required", 400);
  const app = { id: db.nextId.application++, userId: req.auth.userId, programId: parseInt(programId), statusId: 1, createdAt: new Date().toISOString() };
  db.applications.push(app);
  return ok(res, app, 201);
});

// GET /api/applications/:id
router.get("/:id", requireAuth, (req, res) => {
  const app = db.applications.find((a) => a.id === parseInt(req.params.id) && a.userId === req.auth.userId);
  if (!app) return err(res, "Application not found", 404);
  const status = db.getStatus(app.statusId);
  const program = db.getProgram(app.programId);
  const university = program ? db.getUniversity(program.universityId) : null;
  const country = university ? db.getCountry(university.countryId) : null;
  const visaOutcome = db.visaOutcomes.find((v) => v.applicationId === app.id) || null;
  return ok(res, { ...app, status, program: program ? { ...program, university: university ? { ...university, country } : null } : null, visaOutcome });
});

// GET /api/applications/:id/visa-outcome
router.get("/:id/visa-outcome", requireAuth, (req, res) => {
  const app = db.applications.find((a) => a.id === parseInt(req.params.id) && a.userId === req.auth.userId);
  if (!app) return err(res, "Application not found", 404);
  const vo = db.visaOutcomes.find((v) => v.applicationId === app.id);
  if (!vo) return err(res, "No visa outcome found", 404);
  return ok(res, vo);
});

module.exports = router;
