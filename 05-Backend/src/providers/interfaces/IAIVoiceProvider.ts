/**
 * @file src/providers/interfaces/IAIVoiceProvider.ts
 * @description The contract every AI voice provider must implement.
 * Adding a new provider (OpenAI, Azure, PlayHT, etc.) requires only:
 *   1. Creating a class that implements this interface
 *   2. Registering it in AIProviderFactory
 */

import type {
  SynthesisParams,
  SynthesisResult,
  ProviderVoice,
  ProviderHealth,
  AIProviderName,
} from "./types";

export interface IAIVoiceProvider {
  /**
   * Returns the canonical name of this provider.
   * Must match the AI_PROVIDER env var value.
   */
  getProviderName(): AIProviderName;

  /**
   * Synthesizes speech from text using this provider's API.
   * @param params - Typed synthesis parameters
   * @returns A buffer containing raw audio data plus metadata
   * @throws {ProviderError} on API errors, timeouts, or quota limits
   */
  synthesizeSpeech(params: SynthesisParams): Promise<SynthesisResult>;

  /**
   * Retrieves available voices from this provider's catalog.
   * Used by VoiceSyncService to keep the local Voice table up to date.
   * @returns Array of normalized ProviderVoice objects
   * @throws {ProviderError} on API errors
   */
  getVoices(): Promise<ProviderVoice[]>;

  /**
   * Performs a lightweight availability check against the provider's API.
   * Called by AIProviderFactory before returning the provider instance.
   * Should complete in < 5 seconds.
   */
  checkHealth(): Promise<ProviderHealth>;
}
