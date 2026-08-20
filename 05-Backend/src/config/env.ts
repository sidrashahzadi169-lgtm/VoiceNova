/**
 * @file src/config/env.ts
 * @description Fail-fast environment variable validation using Zod.
 * Imported at the very top of index.ts before anything else.
 * If any required variable is missing or malformed, the process exits immediately
 * with a clear, actionable error message — preventing silent runtime failures.
 */

import { z } from "zod";

// ─── Schema Definition ───────────────────────────────────────────────────────

const envSchema = z.object({
  // ── Server ────────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("5000")
    .transform((v) => parseInt(v, 10))
    .refine((v) => !isNaN(v) && v > 0, { message: "PORT must be a positive integer" }),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z
    .string({ required_error: "DATABASE_URL is required" })
    .min(4, { message: "DATABASE_URL must be a valid connection string or SQLite file path" }),

  // ── JWT ───────────────────────────────────────────────────────────────────
  JWT_SECRET: z
    .string({ required_error: "JWT_SECRET is required" })
    .min(32, { message: "JWT_SECRET must be at least 32 characters long" }),
  JWT_REFRESH_SECRET: z
    .string({ required_error: "JWT_REFRESH_SECRET is required" })
    .min(32, { message: "JWT_REFRESH_SECRET must be at least 32 characters long" }),

  // ── AI Provider ───────────────────────────────────────────────────────────
  AI_PROVIDER: z
    .enum(["elevenlabs", "openai", "azure"], {
      errorMap: () => ({ message: "AI_PROVIDER must be one of: elevenlabs, openai, azure" }),
    })
    .default("elevenlabs"),

  // ── ElevenLabs ────────────────────────────────────────────────────────────
  ELEVENLABS_API_KEY: z
    .string({ required_error: "ELEVENLABS_API_KEY is required when AI_PROVIDER=elevenlabs" })
    .min(10, { message: "ELEVENLABS_API_KEY appears too short — check your API key" }),
  ELEVENLABS_MODEL_ID: z
    .string()
    .default("eleven_multilingual_v2"),
  ELEVENLABS_TIMEOUT_MS: z
    .string()
    .default("30000")
    .transform((v) => parseInt(v, 10))
    .refine((v) => !isNaN(v) && v >= 1000, { message: "ELEVENLABS_TIMEOUT_MS must be at least 1000ms" }),
  ELEVENLABS_MAX_RETRIES: z
    .string()
    .default("3")
    .transform((v) => parseInt(v, 10))
    .refine((v) => !isNaN(v) && v >= 0 && v <= 10, { message: "ELEVENLABS_MAX_RETRIES must be between 0 and 10" }),

  // ── Audio Storage ─────────────────────────────────────────────────────────
  AUDIO_STORAGE_PATH: z
    .string()
    .default("./09-uploads"),
});

// ─── Parse & Validate ────────────────────────────────────────────────────────

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `  • [${err.path.join(".")}]: ${err.message}`)
      .join("\n");

    console.error("\n❌  Environment validation failed — cannot start server.\n");
    console.error("Missing or invalid environment variables:\n" + errors);
    console.error("\n📋  Please check your .env file and the README for configuration instructions.\n");

    process.exit(1);
  }

  return result.data;
}

// ─── Export ──────────────────────────────────────────────────────────────────

/** Validated, typed environment configuration. Fails fast on startup if invalid. */
export const env = validateEnv();

export type Env = typeof env;
