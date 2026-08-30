/**
 * @file src/services/GenerationService.ts
 * @description Business logic service for voice generation.
 * Orchestrates: credit validation → provider synthesis → file storage → DB record.
 * The controller delegates entirely to this service — no business logic lives in controllers.
 *
 * This service is provider-agnostic: it uses AIProviderFactory.getProvider()
 * and works with any registered IAIVoiceProvider implementation.
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import prisma from "../config/db";
import logger from "../utils/logger";
import { env } from "../config/env";
import { AIProviderFactory } from "../providers/AIProviderFactory";
import { ProviderError, ProviderErrorCode } from "../providers/errors/ProviderError";
import { FORMAT_TO_EXTENSION, FORMAT_TO_MIME_TYPE } from "../providers/elevenlabs/ElevenLabsConfig";
import type {
  SynthesisParams,
  AudioFormat,
  QualityPreset,
  GenerationResult,
} from "../providers/interfaces/types";

// ─── Service Input ────────────────────────────────────────────────────────────

export interface GenerateSpeechInput {
  userId: string;
  voiceId: string;        // our internal DB voice UUID
  text: string;
  format?: AudioFormat;
  quality?: QualityPreset;
  stability?: number;     // 0–100
  clarity?: number;       // 0–100
  speed?: number;         // 0.25–4.0
  projectId?: string;
}

// ─── Service Error ────────────────────────────────────────────────────────────

export class GenerationServiceError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "GenerationServiceError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, GenerationServiceError.prototype);
  }
}

// ─── Service Class ────────────────────────────────────────────────────────────

export class GenerationService {
  /**
   * Main entry point — validates credits, calls provider, stores audio file, updates DB.
   *
   * @param input - Typed generation parameters
   * @returns GenerationResult with download URL and metadata
   * @throws GenerationServiceError for business rule violations (credit shortage, etc.)
   * @throws ProviderError for synthesis API failures (bubbled up from provider)
   */
  static async generateSpeech(input: GenerateSpeechInput): Promise<GenerationResult> {
    const {
      userId,
      voiceId,
      text,
      format = "MP3",
      quality = "Standard",
      stability,
      clarity,
      speed,
      projectId,
    } = input;

    const operationId = randomUUID().slice(0, 8); // short ID for log correlation

    logger.info(
      `[GenerationService] [${operationId}] Starting generation — ` +
      `user: ${userId}, voice: ${voiceId}, chars: ${text.length}, format: ${format}`
    );

    // ── Step 1: Validate voice exists and retrieve providerVoiceId ───────────
    const voice = await prisma.voice.findFirst({
      where: { id: voiceId, deletedAt: null },
      select: {
        id: true,
        name: true,
        providerVoiceId: true,
        providerName: true,
      },
    });

    if (!voice) {
      throw new GenerationServiceError(
        "Voice profile not found",
        404,
        "VOICE_NOT_FOUND"
      );
    }

    if (!voice.providerVoiceId) {
      throw new GenerationServiceError(
        `Voice "${voice.name}" is not linked to a synthesis provider. ` +
        "Please sync voices from the provider catalog first.",
        422,
        "VOICE_NOT_LINKED"
      );
    }

    logger.debug(
      `[GenerationService] [${operationId}] Voice resolved — ` +
      `name: ${voice.name}, providerVoiceId: ${voice.providerVoiceId}`
    );

    // ── Step 2: Validate project if provided ─────────────────────────────────
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId, deletedAt: null },
        select: { id: true },
      });
      if (!project) {
        throw new GenerationServiceError(
          "Project not found or access denied",
          404,
          "PROJECT_NOT_FOUND"
        );
      }
    }

    // ── Step 3: Credit validation ─────────────────────────────────────────────
    let subscription = await prisma.subscription.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!subscription) {
      // Auto-seed a free trial subscription for new users
      subscription = await prisma.subscription.create({
        data: {
          userId,
          plan: "Free Trial",
          status: "Active",
          creditLimit: 50_000,
          creditUsed: 0,
          endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
      });
      logger.info(
        `[GenerationService] [${operationId}] Free trial subscription seeded for user: ${userId}`
      );
    }

    const charsNeeded = text.length;
    const remaining = subscription.creditLimit - subscription.creditUsed;

    if (remaining < charsNeeded) {
      throw new GenerationServiceError(
        `Insufficient character balance. Required: ${charsNeeded}, Remaining: ${remaining}`,
        403,
        "INSUFFICIENT_CREDITS"
      );
    }

    logger.debug(
      `[GenerationService] [${operationId}] Credit check passed — ` +
      `needed: ${charsNeeded}, remaining: ${remaining}`
    );

    // ── Step 4: Call the AI provider ──────────────────────────────────────────
    const provider = AIProviderFactory.getProvider();
    const providerName = provider.getProviderName();

    const synthesisParams: SynthesisParams = {
      text,
      providerVoiceId: voice.providerVoiceId,
      format,
      quality,
      stability,
      clarity,
      speed,
    };

    let synthesisResult;
    try {
      synthesisResult = await provider.synthesizeSpeech(synthesisParams);
    } catch (error) {
      // If it's a ProviderError, log it and re-throw (controller handles HTTP status)
      if (error instanceof ProviderError) {
        logger.error(
          `[GenerationService] [${operationId}] Provider synthesis failed: ` +
          JSON.stringify(error.toLogEntry())
        );
        throw error;
      }
      throw error;
    }

    logger.info(
      `[GenerationService] [${operationId}] Synthesis success — ` +
      `${synthesisResult.audioBuffer.length} bytes, ${synthesisResult.duration}s, ` +
      `provider: ${providerName}`
    );

    // ── Step 5: Save audio file to disk ───────────────────────────────────────
    const generationId = randomUUID();
    const extension = FORMAT_TO_EXTENSION[format];
    const storageKey = `${generationId}.${extension}`;
    const storagePath = this.resolveStoragePath();
    const filePath = path.join(storagePath, storageKey);

    this.ensureStorageDirectory(storagePath);

    try {
      await fs.promises.writeFile(filePath, synthesisResult.audioBuffer);
      logger.debug(
        `[GenerationService] [${operationId}] Audio saved to: ${filePath}`
      );
    } catch (fsError) {
      const err = fsError as Error;
      logger.error(
        `[GenerationService] [${operationId}] Failed to write audio file: ${err.message}`
      );
      throw new GenerationServiceError(
        "Failed to store generated audio file",
        500,
        "STORAGE_ERROR"
      );
    }

    // ── Step 6: Deduct credits and create DB records ───────────────────────────
    const audioUrl = `/api/voice-generations/download/${generationId}`;

    // Run credit deduction and DB record creation in a single transaction
    const [, generation] = await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: { creditUsed: subscription.creditUsed + charsNeeded },
      }),
      prisma.voiceGeneration.create({
        data: {
          id: generationId,
          userId,
          voiceId,
          projectId: projectId ?? null,
          text,
          duration: synthesisResult.duration,
          format,
          quality,
          audioUrl,
          provider: providerName,
          storageKey,
          charCount: charsNeeded,
        },
      }),
    ]);

    logger.info(
      `[GenerationService] [${operationId}] Generation complete — ` +
      `id: ${generation.id}, credits deducted: ${charsNeeded}`
    );

    return {
      generationId: generation.id,
      duration: synthesisResult.duration,
      charCount: charsNeeded,
      audioUrl,
      format,
      quality,
      voiceName: voice.name,
      provider: providerName,
    };
  }

  /**
   * Resolves the absolute path to the audio storage directory.
   * Handles both relative (from backend root) and absolute paths.
   */
  static resolveStoragePath(): string {
    const storagePath = env.AUDIO_STORAGE_PATH;
    if (path.isAbsolute(storagePath)) {
      return storagePath;
    }
    // Resolve relative path from the backend project root (two levels up from src/services/)
    return path.resolve(process.cwd(), storagePath);
  }

  /**
   * Creates the audio storage directory if it doesn't exist.
   */
  static ensureStorageDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      if (process.env.VERCEL) { dirPath = require("path").join("/tmp", "09-uploads"); }; try { fs.mkdirSync(dirPath, { recursive: true }); } catch (e) {}
      logger.info(`[GenerationService] Created audio storage directory: ${dirPath}`);
    }
  }

  /**
   * Retrieves the absolute file path for a given storageKey.
   * Used by the download controller.
   */
  static getFilePath(storageKey: string): string {
    return path.join(this.resolveStoragePath(), storageKey);
  }

  /**
   * Returns the MIME type for a given audio format.
   */
  static getMimeType(format: AudioFormat): string {
    return FORMAT_TO_MIME_TYPE[format];
  }
}

