const express = require("express");
const { requireAuth, ok } = require("../auth");
const db = require("../store");
const router = express.Router();

// GET /api/documents/list
router.get("/list", requireAuth, (req, res) => {
  const docs = db.userDocuments.filter((d) => d.userId === req.auth.userId);
  return ok(res, docs);
});

// POST /api/documents/upload
router.post("/upload", requireAuth, (req, res) => {
  const { name, type } = req.body || {};
  const doc = {
    id: db.nextId.document++,
    userId: req.auth.userId,
    docType: type || name || "Document",
    filename: (name || "file") + ".pdf",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  db.userDocuments.push(doc);
  return ok(res, doc, 201);
});

module.exports = router;
