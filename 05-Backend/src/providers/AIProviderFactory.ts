/**
 * @file src/providers/AIProviderFactory.ts
 * @description Factory and registry for AI voice providers.
 * Instantiates the correct provider at runtime based on the AI_PROVIDER env var.
 * Adding a new provider requires only adding it to the PROVIDER_REGISTRY map.
 *
 * Usage:
 *   const provider = AIProviderFactory.getProvider();
 *   const result = await provider.synthesizeSpeech(params);
 */

import logger from "../utils/logger";
import { env } from "../config/env";
import { ElevenLabsProvider } from "./elevenlabs/ElevenLabsProvider";
import { ProviderError, ProviderErrorCode } from "./errors/ProviderError";
import type { IAIVoiceProvider } from "./interfaces/IAIVoiceProvider";
import type { AIProviderName } from "./interfaces/types";

// ─── Provider Registry ────────────────────────────────────────────────────────

/**
 * Lazy factory functions for each supported provider.
 * Each function is called once (per provider name) and the result is cached.
 * To add a new provider: add an entry here.
 */
const PROVIDER_REGISTRY: Record<AIProviderName, () => IAIVoiceProvider> = {
  elevenlabs: () =>
    new ElevenLabsProvider({
      apiKey: env.ELEVENLABS_API_KEY,
      modelId: env.ELEVENLABS_MODEL_ID,
      timeoutMs: env.ELEVENLABS_TIMEOUT_MS,
      maxRetries: env.ELEVENLABS_MAX_RETRIES,
    }),

  // ── Future providers (uncomment and implement when ready) ─────────────────
  // openai: () => new OpenAIProvider({ apiKey: env.OPENAI_API_KEY }),
  // azure: () => new AzureSpeechProvider({ region: env.AZURE_REGION, key: env.AZURE_KEY }),
  openai: () => {
    throw new ProviderError({
      code: ProviderErrorCode.UNKNOWN,
      provider: "openai",
      message: "OpenAI provider is not yet implemented. Set AI_PROVIDER=elevenlabs.",
      retryable: false,
    });
  },
  azure: () => {
    throw new ProviderError({
      code: ProviderErrorCode.UNKNOWN,
      provider: "azure",
      message: "Azure provider is not yet implemented. Set AI_PROVIDER=elevenlabs.",
      retryable: false,
    });
  },
};

// ─── Instance Cache ───────────────────────────────────────────────────────────

/** Singleton cache — providers are instantiated once per process lifetime */
const instanceCache = new Map<AIProviderName, IAIVoiceProvider>();

// ─── Factory ──────────────────────────────────────────────────────────────────

export class AIProviderFactory {
  /**
   * Returns a singleton provider instance for the given provider name.
   * Defaults to the AI_PROVIDER env var if no name is supplied.
   *
   * @param providerName - Optional override; defaults to env.AI_PROVIDER
   * @throws ProviderError if the provider name is not registered
   */
  static getProvider(providerName?: AIProviderName): IAIVoiceProvider {
    const name = providerName ?? env.AI_PROVIDER;

    // Return cached instance if available
    if (instanceCache.has(name)) {
      return instanceCache.get(name)!;
    }

    const factory = PROVIDER_REGISTRY[name];
    if (!factory) {
      logger.error(`[AIProviderFactory] Unknown provider requested: ${name}`);
      throw new ProviderError({
        code: ProviderErrorCode.UNKNOWN,
        provider: "elevenlabs", // fallback for error type signature
        message: `AI provider "${name}" is not registered. Available providers: ${Object.keys(PROVIDER_REGISTRY).join(", ")}`,
        retryable: false,
      });
    }

    logger.info(`[AIProviderFactory] Instantiating provider: ${name}`);
    const instance = factory();

    // Cache for future calls
    instanceCache.set(name, instance);

    return instance;
  }

  /**
   * Returns the currently active provider name from environment config.
   */
  static getActiveProviderName(): AIProviderName {
    return env.AI_PROVIDER;
  }

  /**
   * Returns all registered provider names.
   */
  static getRegisteredProviders(): AIProviderName[] {
    return Object.keys(PROVIDER_REGISTRY) as AIProviderName[];
  }

  /**
   * Clears the instance cache. Useful for testing or after configuration changes.
   * Not intended for production use.
   */
  static clearCache(): void {
    instanceCache.clear();
    logger.warn("[AIProviderFactory] Provider instance cache cleared");
  }

  /**
   * Performs a health check on the active provider.
   * Called during server startup to validate API connectivity.
   */
  static async healthCheck(providerName?: AIProviderName): Promise<boolean> {
    try {
      const provider = this.getProvider(providerName);
      const health = await provider.checkHealth();

      if (health.available) {
        logger.info(
          `[AIProviderFactory] Health check passed for ${provider.getProviderName()} ` +
          `(latency: ${health.latencyMs}ms)`
        );
      } else {
        logger.warn(
          `[AIProviderFactory] Health check failed for ${provider.getProviderName()}: ${health.error}`
        );
      }

      return health.available;
    } catch (error) {
      const err = error as Error;
      logger.error(`[AIProviderFactory] Health check threw exception: ${err.message}`);
      return false;
    }
  }
}
