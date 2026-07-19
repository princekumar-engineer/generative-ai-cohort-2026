import { z } from "zod";

export const AnswerSchema = z.object({
  provider: z.string(),
  model: z.string(),
  answer: z.string(),
  timestamp: z.string(),
});

export const EvaluationSchema = z.object({
  finalAnswer: z.string(),
  summary: z.string(),
  strengths: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});