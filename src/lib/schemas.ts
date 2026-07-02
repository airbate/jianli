import { z } from "zod";

export const analyzeRequestSchema = z.object({
  jobDescription: z
    .string()
    .min(50, "Job description is too short")
    .max(15000, "Job description must be 15,000 characters or less"),
  resumeText: z
    .string()
    .min(50, "Resume text is too short")
    .max(10000, "Resume text must be 10,000 characters or less"),
  jobTitle: z
    .string()
    .max(200, "Job title must be 200 characters or less")
    .optional(),
  email: z.string().email("Invalid email").optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const rewriteSchema = z.object({
  original: z.string(),
  suggested: z.string(),
  reason: z.string(),
});

export const analyzeResponseSchema = z.object({
  matchScore: z.number().min(0).max(100),
  scoreLabel: z.enum(["Poor", "Fair", "Good", "Strong"]),
  missingKeywords: z.array(z.string()),
  suggestedRewrites: z.array(rewriteSchema),
  summary: z.string(),
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "FREE_LIMIT_REACHED"
  | "LLM_UNAVAILABLE"
  | "PARSE_ERROR";

export interface ApiErrorResponse {
  error: ApiErrorCode;
  message: string;
}
