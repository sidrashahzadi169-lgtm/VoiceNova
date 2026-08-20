/**
 * @file src/providers/errors/ErrorMapper.ts
 * @description Maps raw ElevenLabs API HTTP errors to typed ProviderError instances.
 * Each provider implements its own mapper. The controller layer only ever sees ProviderError,
 * never raw HTTP status codes or vendor-specific error shapes.
 */

import { ProviderError, ProviderErrorCode } from "./ProviderError";
import type { AIProviderName } from "../interfaces/types";

// ─── ElevenLabs Error Body Shape ──────────────────────────────────────────────

/**
 * ElevenLabs API error response shape.
 * https://elevenlabs.io/docs/api-reference/errors
 */
interface ElevenLabsErrorBody {
  detail?: {
    status?: string;
    message?: string;
    loc?: string[];
  } | string;
  message?: string;
}

// ─── ElevenLabs Error Mapper ──────────────────────────────────────────────────

export class ElevenLabsErrorMapper {
  private static readonly PROVIDER: AIProviderName = "elevenlabs";

  /**
   * Maps an HTTP status code + optional parsed response body to a ProviderError.
   * Called by ElevenLabsProvider when the API returns a non-2xx response.
   */
  static fromHttpError(
    httpStatus: number,
    rawBody: unknown,
    contextMessage?: string
  ): ProviderError {
    const body = rawBody as ElevenLabsErrorBody | undefined;
    const detail = body?.detail;
    const detailMessage = typeof detail === "string" ? detail : detail?.message;
    const detailStatus = typeof detail === "object" ? detail?.status : undefined;
    const rawMessage = detailMessage ?? body?.message ?? contextMessage ?? "Unknown provider error";

    switch (httpStatus) {
      // ── Authentication ────────────────────────────────────────────────────
      case 401:
        return new ProviderError({
          code: ProviderErrorCode.AUTH_FAILED,
          provider: this.PROVIDER,
          message: `ElevenLabs authentication failed: ${rawMessage}`,
          retryable: false,
          httpStatus,
          providerRawError: rawBody,
        });

      // ── Forbidden / Quota / Payment Required ──────────────────────────────
      case 402:
        return new ProviderError({
          code: ProviderErrorCode.QUOTA_EXCEEDED,
          provider: this.PROVIDER,
          message: `ElevenLabs subscription required: ${rawMessage}`,
          retryable: false,
          httpStatus,
          providerRawError: rawBody,
        });

      case 403:
        // ElevenLabs uses 403 for both access control and quota exhaustion
        if (
          detailStatus === "quota_exceeded" ||
          rawMessage.toLowerCase().includes("quota") ||
          rawMessage.toLowerCase().includes("limit")
        ) {
          return new ProviderError({
            code: ProviderErrorCode.QUOTA_EXCEEDED,
            provider: this.PROVIDER,
            message: `ElevenLabs quota exceeded: ${rawMessage}`,
            retryable: false,
            httpStatus,
            providerRawError: rawBody,
          });
        }
        return new ProviderError({
          code: ProviderErrorCode.AUTH_FAILED,
          provider: this.PROVIDER,
          message: `ElevenLabs access forbidden: ${rawMessage}`,
          retryable: false,
          httpStatus,
          providerRawError: rawBody,
        });

      // ── Validation / Bad Request ───────────────────────────────────────────
      case 400:
      case 422:
        // Check if this is a voice-not-found variant
        if (
          detailStatus === "voice_not_found" ||
          rawMessage.toLowerCase().includes("voice")
        ) {
          return new ProviderError({
            code: ProviderErrorCode.INVALID_VOICE,
            provider: this.PROVIDER,
            message: `ElevenLabs voice not found: ${rawMessage}`,
            retryable: false,
            httpStatus,
            providerRawError: rawBody,
          });
        }
        return new ProviderError({
          code: ProviderErrorCode.INVALID_INPUT,
          provider: this.PROVIDER,
          message: `ElevenLabs invalid input: ${rawMessage}`,
          retryable: false,
          httpStatus,
          providerRawError: rawBody,
        });

      // ── Not Found ─────────────────────────────────────────────────────────
      case 404:
        return new ProviderError({
          code: ProviderErrorCode.INVALID_VOICE,
          provider: this.PROVIDER,
          message: `ElevenLabs resource not found: ${rawMessage}`,
          retryable: false,
          httpStatus,
          providerRawError: rawBody,
        });

      // ── Rate Limiting ─────────────────────────────────────────────────────
      case 429:
        return new ProviderError({
          code: ProviderErrorCode.RATE_LIMITED,
          provider: this.PROVIDER,
          message: `ElevenLabs rate limit exceeded: ${rawMessage}`,
          retryable: true,   // safe to retry after backoff
          httpStatus,
          providerRawError: rawBody,
        });

      // ── Server Errors ─────────────────────────────────────────────────────
      case 500:
      case 502:
      case 503:
      case 504:
        return new ProviderError({
          code: ProviderErrorCode.SERVER_ERROR,
          provider: this.PROVIDER,
          message: `ElevenLabs server error (${httpStatus}): ${rawMessage}`,
          retryable: true,   // server errors are generally transient
          httpStatus,
          providerRawError: rawBody,
        });

      // ── Catch-all ─────────────────────────────────────────────────────────
      default:
        return new ProviderError({
          code: ProviderErrorCode.UNKNOWN,
          provider: this.PROVIDER,
          message: `ElevenLabs unexpected error (${httpStatus}): ${rawMessage}`,
          retryable: false,
          httpStatus,
          providerRawError: rawBody,
        });
    }
  }

  /**
   * Maps a low-level network/fetch error (not an HTTP response error) to a ProviderError.
   * Handles timeout aborts, DNS failures, connection refused, etc.
   */
  static fromNetworkError(error: unknown): ProviderError {
    const err = error as Error & { code?: string; name?: string };

    // Timeout — AbortController fires this
    if (err.name === "AbortError" || err.code === "ABORT_ERR") {
      return new ProviderError({
        code: ProviderErrorCode.TIMEOUT,
        provider: this.PROVIDER,
        message: `ElevenLabs request timed out`,
        retryable: true,
        providerRawError: err.message,
      });
    }

    // Network-level failures
    if (
      err.code === "ECONNREFUSED" ||
      err.code === "ENOTFOUND" ||
      err.code === "ETIMEDOUT" ||
      err.code === "ECONNRESET" ||
      err.code === "EHOSTUNREACH"
    ) {
      return new ProviderError({
        code: ProviderErrorCode.NETWORK_ERROR,
        provider: this.PROVIDER,
        message: `ElevenLabs network error: ${err.message}`,
        retryable: true,
        providerRawError: err.code,
      });
    }

    return new ProviderError({
      code: ProviderErrorCode.UNKNOWN,
      provider: this.PROVIDER,
      message: `ElevenLabs unknown error: ${err.message ?? "No message"}`,
      retryable: false,
      providerRawError: err.message,
    });
  }
}
