const { z } = require("zod");

const internshipSchema = z.object({
  title: z.string().trim().min(3).max(120),
  company: z.string().trim().min(2).max(100),
  domain: z.enum(["Technology", "Design", "Marketing", "Business", "Data", "Content", "Other"]),
  location_type: z.enum(["Remote", "Hybrid", "On-site"]),
  duration: z.string().trim().min(2).max(60),
  stipend: z.string().trim().min(1).max(80),
  description: z.string().trim().min(10).max(2000),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  application_url: z.string().url().max(500).nullable().optional()
}).strict();

const updateInternshipSchema = internshipSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

module.exports = { internshipSchema, updateInternshipSchema };
