const express = require("express");
const { requireAdmin, ok, err } = require("../auth");
const db = require("../store");
const router = express.Router();

// ─── Applications ───────────────────────────────────────

// GET /api/admin/applications
router.get("/applications", requireAdmin, (req, res) => {
  const apps = db.applications.map((a) => {
    const status = db.getStatus(a.statusId);
    const user = db.getUser(a.userId);
    const program = db.getProgram(a.programId);
    const university = program ? db.getUniversity(program.universityId) : null;
    const country = university ? db.getCountry(university.countryId) : null;
    return {
      ...a, status,
      user: user ? { id: user.id, name: user.fullname, email: user.email } : null,
      program: program ? { ...program, university: university ? { ...university, country } : null } : null,
    };
  });
  return ok(res, apps);
});

// PUT /api/admin/applications/:id/status
router.put("/applications/:id/status", requireAdmin, (req, res) => {
  const app = db.applications.find((a) => a.id === parseInt(req.params.id));
  if (!app) return err(res, "Application not found", 404);
  const { statusId, statusName } = req.body || {};
  if (statusId) app.statusId = parseInt(statusId);
  else if (statusName) {
    const s = db.getStatusByName(statusName);
    if (s) app.statusId = s.id;
  }
  return ok(res, { ...app, status: db.getStatus(app.statusId) });
});

// POST /api/admin/applications/:id/visa-outcome
router.post("/applications/:id/visa-outcome", requireAdmin, (req, res) => {
  const appId = parseInt(req.params.id);
  const app = db.applications.find((a) => a.id === appId);
  if (!app) return err(res, "Application not found", 404);
  const { result, interviewDate, notes } = req.body || {};
  let vo = db.visaOutcomes.find((v) => v.applicationId === appId);
  if (vo) {
    if (result) vo.decision = result;
    if (notes !== undefined) vo.notes = notes;
    return ok(res, vo);
  }
  vo = { id: db.nextId.visa++, applicationId: appId, decision: result || "Pending", notes: notes || null, createdAt: new Date().toISOString() };
  db.visaOutcomes.push(vo);
  return ok(res, vo, 201);
});

// ─── Countries ──────────────────────────────────────────

// GET /api/admin/countries
router.get("/countries", requireAdmin, (req, res) => ok(res, db.countries));

// POST /api/admin/countries
router.post("/countries", requireAdmin, (req, res) => {
  const { name, code, tier, description, ...rest } = req.body || {};
  const c = { id: db.nextId.country++, name, code, tier: tier || 3, isActive: true, description: description || null, ...rest };
  db.countries.push(c);
  return ok(res, c, 201);
});

// PUT /api/admin/countries/:id
router.put("/countries/:id", requireAdmin, (req, res) => {
  const c = db.countries.find((x) => x.id === parseInt(req.params.id));
  if (!c) return err(res, "Country not found", 404);
  Object.assign(c, req.body);
  return ok(res, c);
});

// DELETE /api/admin/countries/:id
router.delete("/countries/:id", requireAdmin, (req, res) => {
  const idx = db.countries.findIndex((x) => x.id === parseInt(req.params.id));
  if (idx === -1) return err(res, "Country not found", 404);
  db.countries.splice(idx, 1);
  return ok(res, { message: "Deleted" });
});

// ─── Universities ───────────────────────────────────────

// GET /api/admin/universities
router.get("/universities", requireAdmin, (req, res) => {
  return ok(res, db.universities.map((u) => ({ ...u, country: db.getCountry(u.countryId) })));
});

// POST /api/admin/universities
router.post("/universities", requireAdmin, (req, res) => {
  const { name, countryId, ranking, website, ...rest } = req.body || {};
  const u = { id: db.nextId.university++, name, countryId: parseInt(countryId), ranking: ranking || null, website: website || null, ...rest };
  db.universities.push(u);
  return ok(res, u, 201);
});

// PUT /api/admin/universities/:id
router.put("/universities/:id", requireAdmin, (req, res) => {
  const u = db.universities.find((x) => x.id === parseInt(req.params.id));
  if (!u) return err(res, "University not found", 404);
  Object.assign(u, req.body);
  if (req.body.countryId) u.countryId = parseInt(req.body.countryId);
  return ok(res, u);
});

// DELETE /api/admin/universities/:id
router.delete("/universities/:id", requireAdmin, (req, res) => {
  const idx = db.universities.findIndex((x) => x.id === parseInt(req.params.id));
  if (idx === -1) return err(res, "University not found", 404);
  db.universities.splice(idx, 1);
  return ok(res, { message: "Deleted" });
});

// ─── Programs ───────────────────────────────────────────

// GET /api/admin/programs
router.get("/programs", requireAdmin, (req, res) => {
  return ok(res, db.programs.map((p) => {
    const uni = db.getUniversity(p.universityId);
    return { ...p, university: uni ? { ...uni, country: db.getCountry(uni.countryId) } : null };
  }));
});

// POST /api/admin/programs
router.post("/programs", requireAdmin, (req, res) => {
  const { name, universityId, degreeLevel, tuitionFee, duration, ...rest } = req.body || {};
  const p = { id: db.nextId.program++, name, universityId: parseInt(universityId), degreeLevel: degreeLevel || "Masters", tuitionFee: tuitionFee || null, duration: duration || null, ...rest };
  db.programs.push(p);
  return ok(res, p, 201);
});

// PUT /api/admin/programs/:id
router.put("/programs/:id", requireAdmin, (req, res) => {
  const p = db.programs.find((x) => x.id === parseInt(req.params.id));
  if (!p) return err(res, "Program not found", 404);
  Object.assign(p, req.body);
  if (req.body.universityId) p.universityId = parseInt(req.body.universityId);
  return ok(res, p);
});

// DELETE /api/admin/programs/:id
router.delete("/programs/:id", requireAdmin, (req, res) => {
  const idx = db.programs.findIndex((x) => x.id === parseInt(req.params.id));
  if (idx === -1) return err(res, "Program not found", 404);
  db.programs.splice(idx, 1);
  return ok(res, { message: "Deleted" });
});

// ─── Scholarships ───────────────────────────────────────

// GET /api/admin/scholarships
router.get("/scholarships", requireAdmin, (req, res) => {
  return ok(res, db.scholarships.map((s) => ({ ...s, country: db.getCountry(s.countryId) })));
});

// POST /api/admin/scholarships
router.post("/scholarships", requireAdmin, (req, res) => {
  const { name, countryId, amount, deadline, description, ...rest } = req.body || {};
  const s = { id: db.nextId.scholarship++, name, countryId: parseInt(countryId), amount: amount || null, deadline: deadline || null, description: description || null, ...rest };
  db.scholarships.push(s);
  return ok(res, s, 201);
});

// PUT /api/admin/scholarships/:id
router.put("/scholarships/:id", requireAdmin, (req, res) => {
  const s = db.scholarships.find((x) => x.id === parseInt(req.params.id));
  if (!s) return err(res, "Scholarship not found", 404);
  Object.assign(s, req.body);
  if (req.body.countryId) s.countryId = parseInt(req.body.countryId);
  return ok(res, s);
});

// DELETE /api/admin/scholarships/:id
router.delete("/scholarships/:id", requireAdmin, (req, res) => {
  const idx = db.scholarships.findIndex((x) => x.id === parseInt(req.params.id));
  if (idx === -1) return err(res, "Scholarship not found", 404);
  db.scholarships.splice(idx, 1);
  return ok(res, { message: "Deleted" });
});

// ─── Documents ──────────────────────────────────────────

// GET /api/admin/documents
router.get("/documents", requireAdmin, (req, res) => {
  const docs = db.userDocuments.map((d) => {
    const user = db.getUser(d.userId);
    return { ...d, user: user ? { id: user.id, name: user.fullname, email: user.email } : null };
  });
  return ok(res, docs);
});

// PUT /api/admin/documents/:docId/verify
router.put("/documents/:docId/verify", requireAdmin, (req, res) => {
  const doc = db.userDocuments.find((d) => d.id === parseInt(req.params.docId));
  if (!doc) return err(res, "Document not found", 404);
  const { verified } = req.body || {};
  doc.status = verified === false ? "Rejected" : "Verified";
  return ok(res, doc);
});

// ─── Ratings ────────────────────────────────────────────

// GET /api/admin/ratings
router.get("/ratings", requireAdmin, (req, res) => {
  return ok(res, db.countryRatings.map((r) => {
    const user = db.getUser(r.userId);
    return { ...r, country: db.getCountry(r.countryId), user: user ? { id: user.id, name: user.fullname, email: user.email } : null };
  }));
});

module.exports = router;
