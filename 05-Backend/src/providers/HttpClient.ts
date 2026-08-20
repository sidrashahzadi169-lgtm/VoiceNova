/**
 * @file src/providers/HttpClient.ts
 * @description Reusable, typed HTTP client for provider API calls.
 * Features:
 *  - Typed request/response with full generics
 *  - Per-request timeout via AbortController
 *  - Exponential backoff retry with jitter
 *  - Structured Winston request/response logging with unique request IDs
 *  - Binary (Buffer) response support for audio downloads
 */

import { randomUUID } from "crypto";
import logger from "../utils/logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HttpClientOptions {
  /** Base URL prepended to all request paths (no trailing slash) */
  baseUrl: string;

  /** Default headers included in every request */
  defaultHeaders?: Record<string, string>;

  /** Default timeout in ms (can be overridden per request) */
  timeoutMs?: number;

  /** Maximum retry attempts for retriable errors */
  maxRetries?: number;

  /** Human-readable name for logging (e.g. "ElevenLabs") */
  serviceName?: string;
}

export interface RequestOptions {
  /** Additional headers for this specific request */
  headers?: Record<string, string>;

  /** Override the client-level timeout for this request */
  timeoutMs?: number;

  /** Override max retry attempts for this request */
  maxRetries?: number;

  /** If true, returns raw Buffer instead of parsed JSON */
  raw?: boolean;
}

interface RetryContext {
  attempt: number;
  maxRetries: number;
  requestId: string;
  method: string;
  path: string;
  serviceName: string;
}

// ─── Retry Configuration ──────────────────────────────────────────────────────

/** HTTP status codes that are safe to retry */
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/** Base delay in ms for exponential backoff (doubles each attempt) */
const BASE_RETRY_DELAY_MS = 1000;

/** Maximum delay cap to prevent excessive waits */
const MAX_RETRY_DELAY_MS = 30_000;

// ─── HttpClient ───────────────────────────────────────────────────────────────

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly serviceName: string;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, ""); // strip trailing slash
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.maxRetries = options.maxRetries ?? 3;
    this.serviceName = options.serviceName ?? "HttpClient";
  }

  // ─── Public Methods ──────────────────────────────────────────────────────

  /**
   * Performs a GET request and returns a parsed JSON response.
   */
  async get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.request<TResponse>("GET", path, undefined, options);
  }

  /**
   * Performs a POST request with a JSON body and returns a parsed JSON response.
   */
  async post<TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<TResponse> {
    return this.request<TResponse>("POST", path, body, options);
  }

  /**
   * Performs a POST request and returns the raw response body as a Buffer.
   * Used for audio synthesis endpoints that return binary data.
   */
  async postBinary(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Buffer> {
    return this.request<Buffer>("POST", path, body, { ...options, raw: true });
  }

  // ─── Core Request Logic ──────────────────────────────────────────────────

  private async request<TResponse>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<TResponse> {
    const requestId = randomUUID();
    const timeoutMs = options?.timeoutMs ?? this.timeoutMs;
    const maxRetries = options?.maxRetries ?? this.maxRetries;

    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options?.headers ?? {}),
      "X-Request-ID": requestId,
    };

    // Only set Content-Type for requests with a body
    if (body !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const retryCtx: RetryContext = {
      attempt: 0,
      maxRetries,
      requestId,
      method,
      path,
      serviceName: this.serviceName,
    };

    return this.executeWithRetry<TResponse>(url, method, headers, body, timeoutMs, options?.raw ?? false, retryCtx);
  }

  private async executeWithRetry<TResponse>(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: unknown,
    timeoutMs: number,
    raw: boolean,
    ctx: RetryContext
  ): Promise<TResponse> {
    ctx.attempt += 1;
    const startTime = Date.now();

    logger.debug(
      `[${ctx.serviceName}] [${ctx.requestId}] → ${method} ${ctx.path} (attempt ${ctx.attempt}/${ctx.maxRetries + 1})`
    );

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const elapsed = Date.now() - startTime;

      logger.debug(
        `[${ctx.serviceName}] [${ctx.requestId}] ← ${response.status} ${ctx.path} (${elapsed}ms)`
      );

      // ── Handle non-2xx responses ─────────────────────────────────────────
      if (!response.ok) {
        const shouldRetry =
          RETRYABLE_STATUS_CODES.has(response.status) &&
          ctx.attempt <= ctx.maxRetries;

        if (shouldRetry) {
          const delay = this.calculateBackoffDelay(ctx.attempt);
          logger.warn(
            `[${ctx.serviceName}] [${ctx.requestId}] Retriable error ${response.status} on ${ctx.path}. ` +
            `Retrying in ${delay}ms (attempt ${ctx.attempt}/${ctx.maxRetries})`
          );
          await this.sleep(delay);
          return this.executeWithRetry<TResponse>(url, method, headers, body, timeoutMs, raw, ctx);
        }

        // Non-retriable or retries exhausted — let the caller map the error
        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text().catch(() => null);
        }

        // Attach status and body to an error for the ErrorMapper to handle
        const err = new Error(`HTTP ${response.status}`) as Error & {
          httpStatus: number;
          responseBody: unknown;
        };
        err.httpStatus = response.status;
        err.responseBody = errorBody;
        throw err;
      }

      // ── Parse successful response ────────────────────────────────────────
      if (raw) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer) as unknown as TResponse;
      }

      const json = await response.json();
      return json as TResponse;

    } catch (error) {
      const elapsed = Date.now() - startTime;
      const err = error as Error & { httpStatus?: number; responseBody?: unknown };

      // If it's our own HTTP error (already logged above), re-throw as-is
      if (err.httpStatus !== undefined) {
        throw error;
      }

      // Network / abort errors — check if retriable
      const isAbort = err.name === "AbortError";
      const shouldRetry = (isAbort || this.isNetworkError(err)) && ctx.attempt <= ctx.maxRetries;

      if (shouldRetry) {
        const delay = this.calculateBackoffDelay(ctx.attempt);
        logger.warn(
          `[${ctx.serviceName}] [${ctx.requestId}] Network error on ${ctx.path} after ${elapsed}ms. ` +
          `Retrying in ${delay}ms (attempt ${ctx.attempt}/${ctx.maxRetries}): ${err.message}`
        );
        await this.sleep(delay);
        // Create a fresh controller for the retry since the old one is aborted
        return this.executeWithRetry<TResponse>(url, method, headers, body, timeoutMs, raw, ctx);
      }

      logger.error(
        `[${ctx.serviceName}] [${ctx.requestId}] Request failed after ${elapsed}ms: ${err.message}`
      );
      throw error;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  // ─── Utilities ───────────────────────────────────────────────────────────

  /**
   * Calculates exponential backoff delay with full jitter.
   * Formula: min(BASE * 2^(attempt-1), MAX) with ±25% random jitter
   */
  private calculateBackoffDelay(attempt: number): number {
    const exponential = Math.min(
      BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1),
      MAX_RETRY_DELAY_MS
    );
    // Add ±25% jitter to prevent thundering herd
    const jitter = exponential * 0.25 * (Math.random() * 2 - 1);
    return Math.round(exponential + jitter);
  }

  private isNetworkError(err: Error & { code?: string }): boolean {
    return (
      err.code === "ECONNREFUSED" ||
      err.code === "ENOTFOUND" ||
      err.code === "ETIMEDOUT" ||
      err.code === "ECONNRESET" ||
      err.code === "EHOSTUNREACH"
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
