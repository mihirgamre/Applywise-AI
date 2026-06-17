import { ApplicationStatus, Priority } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value === "" ? null : value));
const urlOrBlank = z
  .string()
  .trim()
  .url()
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((value) => value || null);

const optionalDate = z
  .string()
  .optional()
  .nullable()
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Invalid date")
  .transform((value) => (value ? new Date(value) : null));

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1)
});

export const resumeSchema = z.object({
  title: z.string().trim().min(1),
  rawText: z.string().trim().min(20, "Resume text must be at least 20 characters")
});

export const resumeUpdateSchema = resumeSchema.partial().extend({
  title: z.string().trim().min(1).optional(),
  rawText: z.string().trim().min(20).optional()
});

export const jobSchema = z.object({
  company: z.string().trim().min(1),
  title: z.string().trim().min(1),
  location: optionalText,
  jobUrl: urlOrBlank,
  jobDescription: z.string().trim().min(20),
  employmentType: optionalText,
  source: optionalText
});

export const jobUpdateSchema = jobSchema.partial();

export const applicationSchema = z.object({
  jobId: z.string().min(1),
  resumeId: z.string().optional().nullable(),
  status: z.nativeEnum(ApplicationStatus).default(ApplicationStatus.Saved),
  priority: z.nativeEnum(Priority).default(Priority.Medium),
  appliedDate: optionalDate,
  deadline: optionalDate,
  notes: optionalText
});

export const applicationUpdateSchema = applicationSchema.partial();

export const applicationStatusQuerySchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional()
});

export const analysisSchema = z.object({
  jobId: z.string().min(1),
  resumeId: z.string().min(1)
});

export const aiAnalysisResponseSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingSkills: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  suggestedBullets: z.array(z.string()),
  tailoredSummary: z.string(),
  interviewQuestions: z.array(z.string())
});

export type AiAnalysisResponse = z.infer<typeof aiAnalysisResponseSchema>;
