/**
 * @file src/providers/interfaces/types.ts
 * @description Shared type definitions for the AI Voice Provider layer.
 * All providers must use these types — decoupling controllers and services
 * from any vendor-specific data shapes.
 */

// ─── Synthesis Input ──────────────────────────────────────────────────────────

/** Parameters passed to any AI provider for speech synthesis */
export interface SynthesisParams {
  /** The text to synthesize (UTF-8, max provider-specific limit) */
  text: string;

  /**
   * The external provider's voice identifier.
   * For ElevenLabs, this is a string like "21m00Tcm4TlvDq8ikWAM".
   */
  providerVoiceId: string;

  /** Output audio format */
  format: AudioFormat;

  /** Synthesis quality preset */
  quality: QualityPreset;

  /**
   * Voice stability (0–100).
   * Higher = more consistent tone, lower = more expressive variation.
   */
  stability?: number;

  /**
   * Clarity / similarity boost (0–100).
   * Higher = cleaner output closer to original voice characteristics.
   */
  clarity?: number;

  /**
   * Playback speed multiplier (0.25–4.0).
   * 1.0 = normal speed.
   */
  speed?: number;

  /** Optional model override (e.g. "eleven_turbo_v2" for faster synthesis) */
  modelId?: string;
}

// ─── Synthesis Output ─────────────────────────────────────────────────────────

/** Result returned by any AI provider after successful synthesis */
export interface SynthesisResult {
  /** Raw audio data as a Node.js Buffer */
  audioBuffer: Buffer;

  /** Estimated speech duration in seconds (may be approximate) */
  duration: number;

  /** Number of characters actually processed (for billing) */
  characterCount: number;

  /** The audio format of the returned buffer */
  format: AudioFormat;

  /** Provider-assigned identifier for this specific generation (for tracing) */
  providerGenerationId?: string;
}

// ─── Provider Voice ───────────────────────────────────────────────────────────

/** A voice profile as returned from a provider's voice listing API */
export interface ProviderVoice {
  /** The provider's native ID for this voice */
  providerVoiceId: string;

  /** Human-readable display name */
  name: string;

  /** Gender classification */
  gender: VoiceGender;

  /** Language/accent description (e.g. "American English", "British English") */
  accent: string;

  /** Age category */
  age: VoiceAge;

  /** Provider-hosted preview audio URL */
  previewUrl?: string;

  /** Category classification */
  category: VoiceCategory;

  /** Voice description */
  description?: string;

  /** Provider-specific labels/tags */
  labels?: Record<string, string>;
}

// ─── Common Enumerations ──────────────────────────────────────────────────────

export type AudioFormat = "MP3" | "WAV";

export type QualityPreset = "Standard" | "High";

export type VoiceGender = "Male" | "Female" | "Other";

export type VoiceAge = "Child" | "Youth" | "Adult" | "Senior";

export type VoiceCategory = "Standard" | "Premium" | "Clone";

export type AIProviderName = "elevenlabs" | "openai" | "azure";

// ─── Generation Service Result ────────────────────────────────────────────────

/** Result returned by GenerationService to the controller */
export interface GenerationResult {
  generationId: string;
  duration: number;
  charCount: number;
  audioUrl: string;
  format: AudioFormat;
  quality: QualityPreset;
  voiceName: string;
  provider: AIProviderName;
}

// ─── Provider Health ──────────────────────────────────────────────────────────

export interface ProviderHealth {
  available: boolean;
  latencyMs?: number;
  error?: string;
}
