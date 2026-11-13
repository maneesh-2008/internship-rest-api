const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const db = require("./db");
const { internshipSchema, updateInternshipSchema } = require("./validation");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const columns = `id, title, company, domain, location_type, duration, stipend,
  description, skills, application_url, created_at, updated_at`;

function serialize(row) {
  if (!row) return row;
  return { ...row, skills: JSON.parse(row.skills) };
}
function sendValidationError(res, error) {
  return res.status(400).json({
    error: "Validation failed",
    details: error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message
    }))
  });
}

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// GET /api/internships?page=1&limit=10&domain=Technology&search=frontend
app.get("/api/internships", (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page ?? "1", 10);
    const limit = Number.parseInt(req.query.limit ?? "10", 10);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "page must be >= 1 and limit must be between 1 and 100" });
    }
    const conditions = [];
    const params = {};
    if (req.query.domain) {
      conditions.push("domain = @domain");
      params.domain = String(req.query.domain);
    }
    if (req.query.search) {
      conditions.push("(title LIKE @search OR company LIKE @search OR description LIKE @search)");
      params.search = `%${String(req.query.search)}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const total = db.prepare(`SELECT COUNT(*) AS count FROM internships ${where}`).get(params).count;
    const rows = db.prepare(
      `SELECT ${columns} FROM internships ${where} ORDER BY created_at DESC, id DESC LIMIT @limit OFFSET @offset`
    ).all({ ...params, limit, offset: (page - 1) * limit });
    res.json({
      data: rows.map(serialize),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) { next(error); }
});

app.get("/api/internships/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid internship id" });
    const row = db.prepare(`SELECT ${columns} FROM internships WHERE id = ?`).get(id);
    if (!row) return res.status(404).json({ error: "Internship not found" });
    res.json({ data: serialize(row) });
  } catch (error) { next(error); }
});

app.post("/api/internships", (req, res, next) => {
  try {
    const parsed = internshipSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error);
    const item = parsed.data;
    const result = db.prepare(`
      INSERT INTO internships (title, company, domain, location_type, duration, stipend, description, skills, application_url)
      VALUES (@title, @company, @domain, @location_type, @duration, @stipend, @description, @skills, @application_url)
    `).run({ ...item, skills: JSON.stringify(item.skills), application_url: item.application_url ?? null });
    const row = db.prepare(`SELECT ${columns} FROM internships WHERE id = ?`).get(result.lastInsertRowid);
    res.status(201).json({ data: serialize(row) });
  } catch (error) { next(error); }
});

app.patch("/api/internships/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid internship id" });
    const existing = db.prepare("SELECT * FROM internships WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "Internship not found" });
    const parsed = updateInternshipSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error);
    const merged = { ...existing, skills: JSON.parse(existing.skills), ...parsed.data };
    db.prepare(`
      UPDATE internships SET title=@title, company=@company, domain=@domain,
      location_type=@location_type, duration=@duration, stipend=@stipend,
      description=@description, skills=@skills, application_url=@application_url,
      updated_at=CURRENT_TIMESTAMP WHERE id=@id
    `).run({
      ...merged,
      id,
      skills: JSON.stringify(merged.skills ?? []),
      application_url: merged.application_url ?? null
    });
    const updated = db.prepare(`SELECT ${columns} FROM internships WHERE id = ?`).get(id);
    res.json({ data: serialize(updated) });
  } catch (error) { next(error); }
});

app.delete("/api/internships/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid internship id" });
    const result = db.prepare("DELETE FROM internships WHERE id = ?").run(id);
    if (!result.changes) return res.status(404).json({ error: "Internship not found" });
    res.status(204).send();
  } catch (error) { next(error); }
});

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
