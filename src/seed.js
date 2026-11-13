require("dotenv").config();
const db = require("./db");

const records = [
  ["Frontend Developer Intern","BrightPixel Labs","Technology","Remote","3 months","₹8,000 / month","Help build responsive web interfaces and reusable UI components.",["HTML","CSS","JavaScript"],"https://example.com/apply/frontend"],
  ["UI/UX Design Intern","Craft & Co.","Design","Hybrid","2 months","₹6,000 / month","Support user research, wireframes and accessible interface design.",["Figma","Wireframing","Prototyping"],"https://example.com/apply/design"],
  ["Data Analyst Intern","MetricMind","Data","Remote","3 months","₹10,000 / month","Clean datasets and create clear reports for business teams.",["SQL","Excel","Python"],"https://example.com/apply/data"],
  ["Digital Marketing Intern","GoodGrowth","Marketing","On-site","3 months","₹5,000 / month","Assist with search optimization and social media campaigns.",["SEO","Analytics","Social media"],"https://example.com/apply/marketing"],
  ["Business Development Intern","Northstar Works","Business","Hybrid","6 weeks","Performance based","Research potential partners and support outreach activities.",["Research","Communication"],"https://example.com/apply/business"]
];

const insert = db.prepare(`INSERT INTO internships
(title, company, domain, location_type, duration, stipend, description, skills, application_url)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const seed = db.transaction(() => {
  if (db.prepare("SELECT COUNT(*) AS count FROM internships").get().count > 0) return 0;
  for (const record of records) insert.run(...record.slice(0, 7), JSON.stringify(record[7]), record[8]);
  return records.length;
});
console.log(`Seed complete: ${seed()} sample records inserted (existing data is preserved).`);
