# Internship REST API

A Node.js + Express REST API for internship records. It includes SQLite persistence, request validation, pagination, filtering, search and consistent JSON errors.

## Requirements
- Node.js 18 or newer
- npm

## Setup
```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```
Windows PowerShell users can copy the environment file with:
```powershell
Copy-Item .env.example .env
```
API runs at `http://localhost:3000`. SQLite database is created at `data/internships.sqlite` automatically.

## Data model
| Field | Type | Rules |
|---|---|---|
| id | integer | Generated primary key |
| title | string | 3–120 characters |
| company | string | 2–100 characters |
| domain | enum | Technology, Design, Marketing, Business, Data, Content, Other |
| location_type | enum | Remote, Hybrid, On-site |
| duration | string | 2–60 characters |
| stipend | string | 1–80 characters |
| description | string | 10–2000 characters |
| skills | string[] | Up to 20 items |
| application_url | URL or null | Optional |
| created_at / updated_at | timestamp | Managed by database |

## API contract

All successful read/create/update responses use `{ "data": ... }`. List responses also include pagination metadata. Validation errors return HTTP 400 with `{ "error": "Validation failed", "details": [...] }`. Missing records return 404. A successful delete returns 204 with no response body.

| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/health` | Health check | 200 |
| GET | `/api/internships?page=1&limit=10` | List, paginate, filter and search | 200 |
| GET | `/api/internships/:id` | Read one record | 200 |
| POST | `/api/internships` | Create record | 201 |
| PATCH | `/api/internships/:id` | Update supplied fields | 200 |
| DELETE | `/api/internships/:id` | Delete record | 204 |

List query parameters:
- `page`: positive integer; defaults to 1.
- `limit`: integer 1–100; defaults to 10.
- `domain`: exact domain filter, e.g. `Technology`.
- `search`: searches title, company and description.

## Example requests

List:
```bash
curl "http://localhost:3000/api/internships?page=1&limit=5&domain=Technology"
```

Read:
```bash
curl http://localhost:3000/api/internships/1
```

Create:
```bash
curl -X POST http://localhost:3000/api/internships \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Developer Intern",
    "company": "Example Labs",
    "domain": "Technology",
    "location_type": "Remote",
    "duration": "3 months",
    "stipend": "₹9,000 / month",
    "description": "Build and test API endpoints with the engineering team.",
    "skills": ["Node.js", "Express", "SQL"],
    "application_url": "https://example.com/apply"
  }'
```

Update:
```bash
curl -X PATCH http://localhost:3000/api/internships/1 \
  -H "Content-Type: application/json" \
  -d '{"stipend":"₹12,000 / month"}'
```

Delete:
```bash
curl -X DELETE http://localhost:3000/api/internships/1
```

## Suggested validation checks
1. POST a valid internship and confirm HTTP 201.
2. POST with a missing title and confirm HTTP 400 with field details.
3. GET a page with `limit=2` and verify pagination metadata.
4. GET a nonexistent id and confirm HTTP 404.
5. PATCH one field and confirm the other values remain unchanged.
6. DELETE an existing id and confirm HTTP 204; delete it again and confirm 404.

## Notes before submission
- Seed records are fictional examples for development and testing.
- `example.com` application URLs are placeholders, not real vacancies.
- Do not commit `.env`, `node_modules`, or your local SQLite database.
- This project uses SQLite so it can run locally without setting up a separate database server.
