const Database = require("better-sqlite3");
const path = require("node:path");
const fs = require("node:fs");

const databaseFile = process.env.DATABASE_FILE || "./data/internships.sqlite";
const absolutePath = path.resolve(databaseFile);
fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

const db = new Database(absolutePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    domain TEXT NOT NULL,
    location_type TEXT NOT NULL CHECK(location_type IN ('Remote','Hybrid','On-site')),
    duration TEXT NOT NULL,
    stipend TEXT NOT NULL,
    description TEXT NOT NULL,
    skills TEXT NOT NULL DEFAULT '[]',
    application_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
