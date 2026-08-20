/**
 * @file src/providers/errors/ProviderError.ts
 * @description Typed error class for AI provider failures.
 * Ensures controllers never receive raw vendor API errors —
 * all provider errors are normalized to this structured format.
 */

import type { AIProviderName } from "../interfaces/types";

// ─── Error Codes ──────────────────────────────────────────────────────────────

/**
 * Canonical error codes across all providers.
 * Controllers and services use these codes, not HTTP status codes directly.
 */
export enum ProviderErrorCode {
  /** API key missing, revoked, or invalid */
  AUTH_FAILED = "AUTH_FAILED",

  /** Provider rate limit hit (HTTP 429) — retryable after backoff */
  RATE_LIMITED = "RATE_LIMITED",

  /** User's monthly/daily quota on provider side is exhausted */
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",

  /** The requested voice ID does not exist on the provider */
  INVALID_VOICE = "INVALID_VOICE",

  /** The submitted text is empty, too long, or contains invalid characters */
  INVALID_INPUT = "INVALID_INPUT",

  /** HTTP request exceeded the configured timeout */
  TIMEOUT = "TIMEOUT",

  /** DNS resolution, TCP connection, or TLS handshake failure */
  NETWORK_ERROR = "NETWORK_ERROR",

  /** Provider returned an unexpected 5xx error */
  SERVER_ERROR = "SERVER_ERROR",

  /** Provider returned a response that couldn't be parsed or validated */
  INVALID_RESPONSE = "INVALID_RESPONSE",

  /** Catch-all for unclassified errors */
  UNKNOWN = "UNKNOWN",
}

// ─── ProviderError Class ──────────────────────────────────────────────────────

export class ProviderError extends Error {
  /** Machine-readable error code */
  public readonly code: ProviderErrorCode;

  /** Which AI provider threw this error */
  public readonly provider: AIProviderName;

  /**
   * Whether this error is safe to retry.
   * True for: RATE_LIMITED, NETWORK_ERROR, SERVER_ERROR, TIMEOUT
   * False for: AUTH_FAILED, QUOTA_EXCEEDED, INVALID_VOICE, INVALID_INPUT
   */
  public readonly retryable: boolean;

  /** The HTTP status code from the provider's API (if applicable) */
  public readonly httpStatus?: number;

  /** Raw response body from the provider (for debugging) */
  public readonly providerRawError?: unknown;

  constructor(params: {
    code: ProviderErrorCode;
    provider: AIProviderName;
    message: string;
    retryable?: boolean;
    httpStatus?: number;
    providerRawError?: unknown;
    cause?: Error;
  }) {
    super(params.message);
    this.name = "ProviderError";
    this.code = params.code;
    this.provider = params.provider;
    this.retryable = params.retryable ?? false;
    this.httpStatus = params.httpStatus;
    this.providerRawError = params.providerRawError;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ProviderError.prototype);

    // Capture stack trace (V8-specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProviderError);
    }
  }

  /**
   * Returns a sanitized, loggable representation of this error.
   * Excludes raw provider error bodies to prevent sensitive data leaking into logs.
   */
  toLogEntry(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      provider: this.provider,
      message: this.message,
      retryable: this.retryable,
      httpStatus: this.httpStatus,
    };
  }

  /**
   * Returns a safe, client-facing error message.
   * Never exposes internal provider details or raw API responses.
   */
  toClientMessage(): string {
    switch (this.code) {
      case ProviderErrorCode.AUTH_FAILED:
        return "Voice synthesis service authentication failed. Please contact support.";
      case ProviderErrorCode.RATE_LIMITED:
        return "Voice synthesis service is temporarily rate limited. Please retry in a moment.";
      case ProviderErrorCode.QUOTA_EXCEEDED:
        return "Voice synthesis quota has been exceeded. Please upgrade your plan.";
      case ProviderErrorCode.INVALID_VOICE:
        return "The selected voice is not available in the synthesis engine. Please choose another voice.";
      case ProviderErrorCode.INVALID_INPUT:
        return "The text input is invalid or exceeds the maximum length. Please review your script.";
      case ProviderErrorCode.TIMEOUT:
        return "Voice synthesis timed out. Please try again or reduce the text length.";
      case ProviderErrorCode.NETWORK_ERROR:
        return "Unable to reach the voice synthesis service. Please check your connection and retry.";
      case ProviderErrorCode.SERVER_ERROR:
        return "The voice synthesis service encountered an error. Please retry shortly.";
      default:
        return "An unexpected error occurred during voice synthesis. Please try again.";
    }
  }
}
