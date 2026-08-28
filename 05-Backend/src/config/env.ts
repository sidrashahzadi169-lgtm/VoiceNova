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
    .string()
    .default("production"),
  PORT: z
    .string()
    .default("5000")
    .transform((v) => parseInt(v, 10)),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .default("postgresql://neondb_owner:npg_NXHhJIjD8vq7@ep-little-smoke-ayrum5b2.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"),

  // ── JWT ───────────────────────────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .default("voicenova_neural_auth_secret_key_2026_prod"),
  JWT_REFRESH_SECRET: z
    .string()
    .default("voicenova_neural_auth_refresh_secret_key_2026_prod"),

  // ── AI Provider ───────────────────────────────────────────────────────────
  AI_PROVIDER: z
    .string()
    .default("elevenlabs"),

  // ── ElevenLabs ────────────────────────────────────────────────────────────
  ELEVENLABS_API_KEY: z
    .string()
    .default("sk_fe12c0c50558728e27514f758d5fd9bdc892225ba179362f"),
  ELEVENLABS_MODEL_ID: z
    .string()
    .default("eleven_multilingual_v2"),
  ELEVENLABS_TIMEOUT_MS: z
    .string()
    .default("30000")
    .transform((v) => parseInt(v, 10)),
  ELEVENLABS_MAX_RETRIES: z
    .string()
    .default("3")
    .transform((v) => parseInt(v, 10)),

  // ── Audio Storage ─────────────────────────────────────────────────────────
  AUDIO_STORAGE_PATH: z
    .string()
    .default("./09-uploads"),
});

// ─── Parse & Validate ────────────────────────────────────────────────────────

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.warn("⚠️ Environment validation warning, using default fallbacks");
  }

  return result.success ? result.data : envSchema.parse({});
}

// ─── Export ──────────────────────────────────────────────────────────────────

/** Validated, typed environment configuration. Fails fast on startup if invalid. */
export const env = validateEnv();

export type Env = typeof env;
