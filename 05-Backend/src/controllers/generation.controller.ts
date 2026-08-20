/**
 * @file src/controllers/generation.controller.ts
 * @description Controller for voice generation endpoints.
 * Thin layer: validates HTTP input, delegates to GenerationService,
 * maps service errors to HTTP responses.
 *
 * No business logic, no provider knowledge — all of that lives in
 * GenerationService and the provider layer.
 */

import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";
import logger from "../utils/logger";
import { GenerationService, GenerationServiceError } from "../services/GenerationService";
import { ProviderError } from "../providers/errors/ProviderError";
import type { AudioFormat, QualityPreset } from "../providers/interfaces/types";

// ─── POST /api/voice-generations/generate ────────────────────────────────────

export async function generateSpeech(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id!;
    const {
      projectId,
      voiceId,
      text,
      format,
      quality,
      stability,
      clarity,
      speed,
    } = req.body;

    // ── Input validation ────────────────────────────────────────────────────
    if (!voiceId || typeof voiceId !== "string") {
      res.status(400).json({ success: false, message: "voiceId is required" });
      return;
    }
    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ success: false, message: "text is required and must be a non-empty string" });
      return;
    }
    if (text.length > 5000) {
      res.status(400).json({
        success: false,
        message: `Text exceeds maximum length of 5000 characters (received ${text.length})`
      });
      return;
    }

    const validFormats: AudioFormat[] = ["MP3", "WAV"];
    if (format && !validFormats.includes(format)) {
      res.status(400).json({
        success: false,
        message: `Invalid format "${format}". Valid options: ${validFormats.join(", ")}`
      });
      return;
    }

    const validQualities: QualityPreset[] = ["Standard", "High"];
    if (quality && !validQualities.includes(quality)) {
      res.status(400).json({
        success: false,
        message: `Invalid quality "${quality}". Valid options: ${validQualities.join(", ")}`
      });
      return;
    }

    // ── Delegate to GenerationService ───────────────────────────────────────
    const result = await GenerationService.generateSpeech({
      userId,
      voiceId,
      text,
      format: format ?? "MP3",
      quality: quality ?? "Standard",
      stability: stability !== undefined ? Number(stability) : undefined,
      clarity: clarity !== undefined ? Number(clarity) : undefined,
      speed: speed !== undefined ? Number(speed) : undefined,
      projectId,
    });

    res.status(201).json({
      success: true,
      message: "Speech synthesized successfully",
      data: {
        generationId: result.generationId,
        duration: result.duration,
        charCount: result.charCount,
        audioUrl: result.audioUrl,
        format: result.format,
        quality: result.quality,
        voiceName: result.voiceName,
        provider: result.provider,
      },
    });
  } catch (error) {
    // ── Handle known error types ────────────────────────────────────────────

    if (error instanceof GenerationServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
      });
      return;
    }

    if (error instanceof ProviderError) {
      const httpStatus = error.httpStatus ?? 502;
      res.status(httpStatus).json({
        success: false,
        message: error.toClientMessage(),
        code: error.code,
        provider: error.provider,
      });
      return;
    }

    // Unexpected errors go to the global error handler
    next(error);
  }
}

// ─── GET /api/voice-generations/download/:id ─────────────────────────────────

export async function downloadFile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const generation = await prisma.voiceGeneration.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        format: true,
        storageKey: true,
        audioUrl: true,
        createdAt: true,
        voice: {
          select: { name: true },
        },
      },
    });

    if (!generation) {
      res.status(404).json({ success: false, message: "Generated audio file not found" });
      return;
    }

    const format = generation.format as AudioFormat;

    // ── Serve real audio file if it exists on disk ──────────────────────────
    if (generation.storageKey) {
      const filePath = GenerationService.getFilePath(generation.storageKey);

      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const mimeType = GenerationService.getMimeType(format);

        // Build a descriptive filename: voicenova_{VoiceName}_{YYYY-MM-DD}.mp3
        const voiceName = (generation.voice?.name ?? "voice")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_");
        const dateStr = generation.createdAt
          .toISOString()
          .slice(0, 10); // YYYY-MM-DD
        const filename = `voicenova_${voiceName}_${dateStr}.${format.toLowerCase()}`;

        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Length", stat.size);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
        );
        res.setHeader("Cache-Control", "private, max-age=3600");
        res.setHeader("Accept-Ranges", "bytes");

        const readStream = fs.createReadStream(filePath);
        readStream.on("error", (err) => {
          logger.error(`[downloadFile] File stream error for ${filePath}: ${err.message}`);
          if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Error reading audio file" });
          }
        });

        readStream.pipe(res);
        return;
      }

      logger.warn(`[downloadFile] Audio file not found on disk: ${filePath}`);
    }

    // ── Fallback: 404 ────────────────────────────────────────────────────────
    res.status(404).json({
      success: false,
      message: "Audio file not found on storage. The generation may have expired.",
    });
  } catch (error) {
    next(error);
  }
}


// ─── GET /api/voice-generations/history ──────────────────────────────────────

export async function getHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id!;
    const { limit = "20", offset = "0" } = req.query;

    const take = Math.min(Math.max(1, parseInt(String(limit), 10) || 20), 100);
    const skip = Math.max(0, parseInt(String(offset), 10) || 0);

    const [history, total] = await prisma.$transaction([
      prisma.voiceGeneration.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take,
        skip,
        select: {
          id: true,
          text: true,
          duration: true,
          audioUrl: true,
          format: true,
          quality: true,
          charCount: true,
          provider: true,
          createdAt: true,
          voice: {
            select: { name: true, accent: true },
          },
        },
      }),
      prisma.voiceGeneration.count({
        where: { userId, deletedAt: null },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        limit: take,
        offset: skip,
        hasMore: skip + take < total,
      },
    });
  } catch (error) {
    next(error);
  }
}
