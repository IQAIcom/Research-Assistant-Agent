// src/env.ts

import { config } from "dotenv";
import { z } from "zod";

config();

export const envSchema = z.object({
  ADK_DEBUG: z.coerce.boolean().default(false),
  GOOGLE_API_KEY: z.string(),
  LLM_MODEL: z.string().default("gemini-2.5-flash"),
  TAVILY_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
