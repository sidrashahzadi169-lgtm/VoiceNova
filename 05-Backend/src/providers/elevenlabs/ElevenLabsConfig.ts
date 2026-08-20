/**
 * @file src/providers/elevenlabs/ElevenLabsConfig.ts
 * @description ElevenLabs-specific configuration constants, mappings, and defaults.
 * Centralizes all provider-specific knowledge so ElevenLabsProvider stays clean.
 */

import type { AudioFormat, QualityPreset } from "../interfaces/types";

// ─── API Configuration ────────────────────────────────────────────────────────

export const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

/** ElevenLabs API endpoints */
export const ELEVENLABS_ENDPOINTS = {
  TEXT_TO_SPEECH: (voiceId: string) => `/text-to-speech/${voiceId}`,
  TEXT_TO_SPEECH_STREAM: (voiceId: string) => `/text-to-speech/${voiceId}/stream`,
  VOICES: "/voices",
  USER: "/user",
  USER_SUBSCRIPTION: "/user/subscription",
} as const;

// ─── Model Identifiers ────────────────────────────────────────────────────────

/**
 * Supported ElevenLabs model IDs.
 * See: https://elevenlabs.io/docs/speech-synthesis/models
 */
export const ELEVENLABS_MODELS = {
  /** Highest quality, supports 29 languages */
  MULTILINGUAL_V2: "eleven_multilingual_v2",

  /** English-only, balanced quality/speed */
  MONOLINGUAL_V1: "eleven_monolingual_v1",

  /** Low-latency turbo model, ~50% faster */
  TURBO_V2: "eleven_turbo_v2",

  /** Multilingual turbo model */
  TURBO_V2_5: "eleven_turbo_v2_5",
} as const;

// ─── Output Format Mapping ────────────────────────────────────────────────────

/**
 * Maps our internal AudioFormat enum to ElevenLabs output_format strings.
 * See: https://elevenlabs.io/docs/api-reference/text-to-speech
 */
export const FORMAT_TO_ELEVENLABS: Record<AudioFormat, string> = {
  MP3: "mp3_44100_128",   // 44.1kHz, 128kbps — good quality/size balance
  WAV: "pcm_44100",       // 44.1kHz PCM — lossless, larger file size
};

/**
 * MIME type map for HTTP Content-Type and file download headers.
 */
export const FORMAT_TO_MIME_TYPE: Record<AudioFormat, string> = {
  MP3: "audio/mpeg",
  WAV: "audio/wav",
};

/**
 * File extension map for generated audio filenames.
 */
export const FORMAT_TO_EXTENSION: Record<AudioFormat, string> = {
  MP3: "mp3",
  WAV: "wav",
};

// ─── Quality Preset Mapping ───────────────────────────────────────────────────

/**
 * Maps our QualityPreset to ElevenLabs voice_settings ranges.
 * ElevenLabs uses 0.0–1.0 floats; our UI uses 0–100 integers.
 */
export const QUALITY_VOICE_SETTINGS: Record<
  QualityPreset,
  { stability: number; similarity_boost: number; style: number }
> = {
  Standard: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
  },
  High: {
    stability: 0.7,
    similarity_boost: 0.85,
    style: 0.3,
  },
};

// ─── Parameter Normalization ──────────────────────────────────────────────────

/**
 * Normalizes our 0–100 integer stability to ElevenLabs 0.0–1.0 float.
 * Clamps to valid range.
 */
export function normalizeStability(value: number): number {
  return Math.max(0, Math.min(1, value / 100));
}

/**
 * Normalizes our 0–100 integer clarity to ElevenLabs similarity_boost 0.0–1.0 float.
 * Clamps to valid range.
 */
export function normalizeClarity(value: number): number {
  return Math.max(0, Math.min(1, value / 100));
}

/**
 * ElevenLabs doesn't support a speed parameter natively in the voice settings.
 * Speed is controlled by the model — turbo models are faster, not parameterized.
 * We log a warning if speed != 1.0, as it's not applied to the API call.
 */
export const SPEED_SUPPORTED = false;

// ─── ElevenLabs Voice Response Shape ─────────────────────────────────────────

/**
 * Shape of a voice object returned by GET /voices
 * https://elevenlabs.io/docs/api-reference/get-voices
 */
export interface ElevenLabsVoiceResponse {
  voice_id: string;
  name: string;
  preview_url?: string;
  category?: string;
  description?: string;
  labels?: {
    accent?: string;
    age?: string;
    gender?: string;
    use_case?: string;
    language?: string;
    [key: string]: string | undefined;
  };
  available_for_tiers?: string[];
}

export interface ElevenLabsVoicesListResponse {
  voices: ElevenLabsVoiceResponse[];
}

// ─── ElevenLabs TTS Request Body ─────────────────────────────────────────────

/**
 * Request body for POST /text-to-speech/{voice_id}
 * https://elevenlabs.io/docs/api-reference/text-to-speech
 */
export interface ElevenLabsTTSRequestBody {
  text: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

// ─── ElevenLabs User/Subscription Shape ──────────────────────────────────────

export interface ElevenLabsSubscriptionResponse {
  tier: string;
  character_count: number;
  character_limit: number;
  status: string;
}
