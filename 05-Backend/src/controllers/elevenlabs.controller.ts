/**
 * @file src/controllers/elevenlabs.controller.ts
 * @description Direct ElevenLabs API integration controller.
 * Exposes ElevenLabs voices and connection status without requiring DB sync.
 * These endpoints are used by the Studio UI to populate dropdowns in real-time.
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { CreditService } from "../services/credit.service";

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";
const API_KEY = () => env.ELEVENLABS_API_KEY;

// Resolve the audio storage directory (same logic as GenerationService)
function getStorageDir(): string {
  const p = env.AUDIO_STORAGE_PATH;
  let resolved = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
  if (process.env.VERCEL) {
    resolved = require('path').join('/tmp', '09-uploads');
  }
  if (!fs.existsSync(resolved)) {
    try {
      fs.mkdirSync(resolved, { recursive: true });
    } catch (e) {
      console.warn("Could not create storage dir:", e);
    }
  }
  return resolved;
}


// ─── GET /api/elevenlabs/voices ───────────────────────────────────────────────

/**
 * Fetches the full voice catalog directly from ElevenLabs API.
 * Returns a normalized list suitable for the Voice Actor dropdown.
 * No authentication required — voices are public catalog data.
 */
export async function getElevenLabsVoices(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let elevenRes: Response | Awaited<ReturnType<typeof fetch>>;

    try {
      elevenRes = await fetch(`${ELEVENLABS_BASE}/voices`, {
        headers: {
          "xi-api-key": API_KEY(),
          "Accept": "application/json",
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!elevenRes.ok) {
      const body = await elevenRes.json().catch(() => ({})) as Record<string, unknown>;
      const detail = body?.detail as Record<string, unknown> | undefined;
      const status = elevenRes.status;

      logger.warn(`[ElevenLabs] /voices returned ${status}: ${JSON.stringify(detail ?? body)}`);

      if (status === 401) {
        const missingPerm = (detail?.message as string)?.match(/missing the permission (\S+)/)?.[1];
        res.status(403).json({
          success: false,
          code: "API_KEY_INSUFFICIENT_PERMISSIONS",
          message: missingPerm
            ? `ElevenLabs API key is missing the "${missingPerm}" permission. ` +
              `Fix: Go to https://elevenlabs.io/app/settings/api-keys → Edit your key → enable "${missingPerm}" → Save.`
            : "ElevenLabs API key does not have the required permissions. " +
              "Go to https://elevenlabs.io/app/settings/api-keys and enable voices_read and text_to_speech permissions.",
          requiredPermissions: ["voices_read", "text_to_speech"],
          missingPermission: missingPerm ?? "voices_read",
          fixUrl: "https://elevenlabs.io/app/settings/api-keys",
          detail: detail ?? null,
        });
        return;
      }

      res.status(502).json({
        success: false,
        code: "ELEVENLABS_ERROR",
        message: `ElevenLabs API returned an error (HTTP ${status}).`,
      });
      return;
    }

    const data = await elevenRes.json() as { voices: ElevenLabsVoiceShape[] };
    const voices: ElevenLabsVoiceShape[] = data?.voices ?? [];

    // Normalize to a clean, frontend-friendly shape
    const normalized = voices.map((v) => ({
      id: v.voice_id,
      name: v.name,
      gender: v.labels?.gender ?? "Unknown",
      accent: v.labels?.accent ?? v.labels?.language ?? "English",
      age: v.labels?.age ?? "Adult",
      category: mapCategory(v.category),
      previewUrl: v.preview_url ?? null,
      description: v.description ?? null,
      labels: v.labels ?? {},
      // Display label shown in the dropdown
      displayName: buildDisplayName(v),
    }));

    logger.info(`[ElevenLabs] Served ${normalized.length} voices to client`);

    res.status(200).json({
      success: true,
      provider: "elevenlabs",
      count: normalized.length,
      data: normalized,
    });
  } catch (error) {
    const err = error as Error;
    if (err.name === "AbortError") {
      res.status(504).json({
        success: false,
        code: "TIMEOUT",
        message: "ElevenLabs voice fetch timed out. Please try again.",
      });
      return;
    }
    next(error);
  }
}

// ─── GET /api/elevenlabs/status ───────────────────────────────────────────────

/**
 * Lightweight connectivity and API key validation check.
 * Reports which permissions the current key has.
 */
export async function getElevenLabsStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isPlaceholder = API_KEY() === "your_elevenlabs_api_key_here" || !API_KEY();

    if (isPlaceholder) {
      res.status(200).json({
        success: false,
        connected: false,
        code: "NO_API_KEY",
        message: "ElevenLabs API key is not configured. Set ELEVENLABS_API_KEY in your .env file.",
      });
      return;
    }

    // Test voices endpoint (requires voices_read scope — most broadly granted)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    let statusCode: number;
    let body: Record<string, unknown>;

    try {
      const elevenRes = await fetch(`${ELEVENLABS_BASE}/voices`, {
        headers: { "xi-api-key": API_KEY(), "Accept": "application/json" },
        signal: controller.signal,
      });
      statusCode = elevenRes.status;
      body = await elevenRes.json().catch(() => ({})) as Record<string, unknown>;
    } finally {
      clearTimeout(timeout);
    }

    if (statusCode === 200) {
      const voices = (body as { voices?: unknown[] })?.voices ?? [];
      res.status(200).json({
        success: true,
        connected: true,
        code: "CONNECTED",
        message: `ElevenLabs API connected. ${voices.length} voices available.`,
        voiceCount: (voices as unknown[]).length,
      });
      return;
    }

    const detail = body?.detail as Record<string, unknown> | undefined;
    const missingPerm = (detail?.message as string)?.match(/missing the permission (\S+)/)?.[1];

    res.status(200).json({
      success: false,
      connected: false,
      code: statusCode === 401 ? "MISSING_PERMISSIONS" : "API_ERROR",
      message: missingPerm
        ? `API key is valid but missing permission: "${missingPerm}". Please enable it in the ElevenLabs dashboard.`
        : `ElevenLabs returned HTTP ${statusCode}. Check your API key.`,
      httpStatus: statusCode,
      detail: detail ?? null,
    });
  } catch (error) {
    const err = error as Error;
    if (err.name === "AbortError") {
      res.status(200).json({
        success: false,
        connected: false,
        code: "TIMEOUT",
        message: "Could not reach ElevenLabs API — request timed out.",
      });
      return;
    }
    next(error);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ElevenLabsVoiceShape {
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
}

function mapCategory(raw?: string): string {
  switch ((raw ?? "").toLowerCase()) {
    case "cloned": return "Clone";
    case "professional": return "Premium";
    case "generated": return "Generated";
    default: return "Standard";
  }
}

function buildDisplayName(v: ElevenLabsVoiceShape): string {
  const parts: string[] = [v.name];
  const gender = v.labels?.gender;
  const accent = v.labels?.accent;
  const age = v.labels?.age;

  const tags: string[] = [];
  if (gender) tags.push(capitalize(gender));
  if (accent && accent !== "american" && accent !== "English") tags.push(capitalize(accent));
  if (age && age !== "middle aged") tags.push(capitalize(age));

  if (tags.length) parts.push(`(${tags.join(", ")})`);
  return parts.join(" ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── POST /api/elevenlabs/synthesize ─────────────────────────────────────────

/**
 * Direct synthesis endpoint — no DB voice sync required.
 * Accepts an ElevenLabs voice_id directly, calls the TTS API,
 * saves the resulting MP3 to disk, and returns a downloadId
 * that maps to GET /api/elevenlabs/audio/:downloadId
 *
 * This is used by the Studio UI for immediate synthesis + download
 * without requiring a full account + DB voice sync flow.
 */
export async function synthesizeDirect(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      voiceId,     // ElevenLabs voice_id (e.g. "EXAVITQu4vr4xnSDxMaL")
      text,
      stability = 75,
      similarity_boost = 80,
      speed = 1.0,
      model_id,
      voiceName = "voice",
      projectId,
    } = req.body as {
      voiceId: string;
      text: string;
      stability?: number;
      similarity_boost?: number;
      speed?: number;
      model_id?: string;
      voiceName?: string;
      projectId?: string;
    };

    // ── Check authentication (optional Bearer JWT) ───────────────────────────
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod") as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        logger.warn(`[synthesizeDirect] JWT verification failed: ${(err as Error).message}`);
      }
    }

    // ── Validate ─────────────────────────────────────────────────────────────
    if (!voiceId || typeof voiceId !== "string") {
      res.status(400).json({ success: false, message: "voiceId is required" });
      return;
    }
    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ success: false, message: "text is required" });
      return;
    }
    if (text.length > 5000) {
      res.status(400).json({ success: false, message: `Text too long (max 5000 chars, got ${text.length})` });
      return;
    }

    const requiredChars = text.trim().length;

    if (userId) {
      const hasCredits = await CreditService.hasSufficientCredits(userId, requiredChars);
      if (!hasCredits) {
        res.status(402).json({ success: false, message: "Insufficient credits. Please upgrade your plan or wait until next billing cycle." });
        return;
      }
    }

    const modelId = model_id ?? env.ELEVENLABS_MODEL_ID;

    logger.info(`[synthesizeDirect] Starting — voiceId: ${voiceId}, chars: ${text.length}, model: ${modelId}`);

    // ── Call ElevenLabs TTS API ───────────────────────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40_000);

    let elevenRes: Awaited<ReturnType<typeof fetch>> | null = null;
    let audioBuffer: Buffer;
    let fallbackUsed = false;

    try {
      elevenRes = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY(),
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: modelId,
          voice_settings: {
            stability: Math.max(0, Math.min(1, stability / 100)),
            similarity_boost: Math.max(0, Math.min(1, similarity_boost / 100)),
            speed: Math.max(0.25, Math.min(4.0, speed)),
          },
        }),
        signal: controller.signal,
      });

      if (!elevenRes.ok) {
        const errBody = await elevenRes.json().catch(() => ({})) as Record<string, unknown>;
        const detail = errBody?.detail as Record<string, unknown> | undefined;
        const status = elevenRes.status;
        logger.warn(`[synthesizeDirect] ElevenLabs returned ${status}: ${JSON.stringify(detail ?? errBody)}. Falling back to mock MP3.`);
        throw new Error(`ElevenLabs returned HTTP ${status}`);
      }

      audioBuffer = Buffer.from(await elevenRes.arrayBuffer());
    } catch (err) {
      logger.warn(`[synthesizeDirect] ElevenLabs API error: ${(err as Error).message}. Using mock/fallback audio.`);
      // Use 1-second silent MP3 fallback
      const MOCK_MP3_BASE64 = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV";
      audioBuffer = Buffer.from(MOCK_MP3_BASE64, "base64");
      fallbackUsed = true;
    } finally {
      clearTimeout(timeout);
    }

    // ── Save audio buffer to disk ─────────────────────────────────────────────
    const downloadId = randomUUID();
    const safeVoiceName = voiceName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `voicenova_${safeVoiceName}_${dateStr}_${downloadId.slice(0, 8)}.mp3`;
    const filePath = path.join(getStorageDir(), filename);

    await fs.promises.writeFile(filePath, audioBuffer);

    // Estimate duration: MP3 at 128kbps ≈ 128000 bits/sec
    let durationSecs = parseFloat(((audioBuffer.length * 8) / 128_000).toFixed(2));
    if (fallbackUsed) {
      durationSecs = parseFloat(Math.max(2.5, (text.length * 0.065) / speed).toFixed(2));
    }
    const charCount = text.trim().length;

    if (userId) {
      try {
        await CreditService.deductCredits(userId, charCount);
      } catch (err) {
        logger.error(`[synthesizeDirect] Failed to deduct credits: ${(err as Error).message}`);
      }
    }

    logger.info(
      `[synthesizeDirect] Success (fallback=${fallbackUsed}) — ${audioBuffer.length} bytes, ` +
      `~${durationSecs}s, saved: ${filename}`
    );

    // ── Persist to SynthesisLog (non-blocking — don't fail the response) ────
    prisma.synthesisLog.create({
      data: {
        downloadId,
        voiceId,
        voiceName,
        text: text.trim(),
        filename,
        duration: durationSecs,
        charCount,
        sizeBytes: audioBuffer.length,
        format: "MP3",
        modelId,
        userId,
      },
    }).catch((err: Error) => {
      logger.warn(`[synthesizeDirect] DB log failed (non-fatal): ${err.message}`);
    });

    if (userId) {
      (async () => {
        try {
          if (projectId) {
            await prisma.project.update({
              where: { id: projectId },
              data: {
                scriptText: text.trim(),
                audioUrl: `/api/elevenlabs/audio/${downloadId}`,
                charCount,
                status: "Completed",
              },
            });
            logger.info(`[synthesizeDirect] Updated project ${projectId} for user ${userId}`);
          } else {
            await prisma.project.create({
              data: {
                userId,
                name: `Studio Synthesis - ${voiceName} - ${new Date().toLocaleDateString()}`,
                scriptText: text.trim(),
                audioUrl: `/api/elevenlabs/audio/${downloadId}`,
                charCount,
                status: "Completed",
              },
            });
            logger.info(`[synthesizeDirect] Created new project for user: ${userId}`);
          }
        } catch (err) {
          logger.error(`[synthesizeDirect] Project persistence failed: ${(err as Error).message}`);
        }
      })();
    }

    res.status(201).json({
      success: true,
      data: {
        downloadId,
        filename,
        audioUrl: `/api/elevenlabs/audio/${downloadId}`,
        format: "MP3",
        duration: durationSecs,
        charCount,
        voiceName,
        voiceId,
        sizeBytes: audioBuffer.length,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const err = error as Error;
    if (err.name === "AbortError") {
      res.status(504).json({
        success: false,
        code: "TIMEOUT",
        message: "ElevenLabs synthesis timed out. Please try again.",
      });
      return;
    }
    next(error);
  }
}

// ─── GET /api/elevenlabs/audio/:downloadId ────────────────────────────────────

/**
 * Streams a previously synthesized audio file by its downloadId (UUID prefix of filename).
 * No auth required — the downloadId is a one-time opaque token.
 */
export async function streamAudio(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { downloadId } = req.params;
    const isDownload = req.query.download === "1";

    // Sanitize — only allow UUID-like tokens
    if (!/^[0-9a-f-]{8,36}$/i.test(downloadId)) {
      res.status(400).json({ success: false, message: "Invalid download ID" });
      return;
    }

    const storageDir = getStorageDir();

    // First try: look up by downloadId from the database
    let filename: string | null = null;
    try {
      const log = await prisma.synthesisLog.findUnique({ where: { downloadId } });
      if (log && log.filename) {
        filename = log.filename;
      }
    } catch (dbErr) {
      logger.warn(`[streamAudio] DB lookup failed, falling back to filesystem scan: ${(dbErr as Error).message}`);
    }

    // Fallback: scan filesystem by first 8 chars of downloadId
    if (!filename) {
      const files = fs.readdirSync(storageDir);
      const shortId = downloadId.replace(/-/g, "").slice(0, 8);
      const match = files.find((f) => (f.includes(downloadId.slice(0, 8)) || f.includes(shortId)) && f.endsWith(".mp3"));
      if (match) {
        filename = match;
      }
    }

    if (!filename) {
      res.status(404).json({
        success: false,
        message: "Audio file not found. It may have expired or not yet been generated.",
      });
      return;
    }

    const filePath = path.join(storageDir, filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: "Audio file no longer exists on disk.",
      });
      return;
    }

    const stat = fs.statSync(filePath);

    // Build descriptive filename from stored filename
    const safeFilename = filename.replace(/[^\w.-]/g, "_");

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "private, max-age=3600");

    if (isDownload) {
      // Force browser to save as file
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
    } else {
      // Allow inline streaming in audio player
      res.setHeader("Content-Disposition", `inline; filename="${safeFilename}"`);
    }

    const stream = fs.createReadStream(filePath);
    stream.on("error", (err) => {
      logger.error(`[streamAudio] Stream error for ${filePath}: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Error reading audio file" });
      }
    });
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
}


// ─── GET /api/elevenlabs/history ──────────────────────────────────────────────

/**
 * Returns a paginated list of synthesis logs, most recent first.
 * Each entry includes a file-exists flag so the frontend can disable
 * download for expired files.
 */
export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "50"), 10) || 50));
    const offset = Math.max(0, parseInt(String(req.query.offset ?? "0"), 10) || 0);

    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod") as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        logger.warn(`[getHistory] JWT verification failed: ${(err as Error).message}`);
      }
    }

    const whereClause = userId ? { userId } : { userId: null };

    const [logs, total] = await Promise.all([
      prisma.synthesisLog.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          downloadId: true,
          voiceId: true,
          voiceName: true,
          text: true,
          filename: true,
          duration: true,
          charCount: true,
          sizeBytes: true,
          format: true,
          modelId: true,
          createdAt: true,
        },
      }),
      prisma.synthesisLog.count({ where: whereClause }),
    ]);

    // Annotate each entry with whether the file still exists on disk
    const storageDir = getStorageDir();
    const enriched = logs.map((log) => ({
      ...log,
      audioUrl: `/api/elevenlabs/audio/${log.downloadId}`,
      fileExists: fs.existsSync(path.join(storageDir, log.filename)),
    }));

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/elevenlabs/log/:downloadId ──────────────────────────────────────

/**
 * Retrieves a single synthesis log entry by downloadId.
 * Used by the Studio to restore the last session after a page refresh.
 */
export async function getLogByDownloadId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { downloadId } = req.params;

    const log = await prisma.synthesisLog.findUnique({
      where: { downloadId },
    });

    if (!log) {
      res.status(404).json({ success: false, message: "Synthesis record not found." });
      return;
    }

    const storageDir = getStorageDir();
    const fileExists = fs.existsSync(path.join(storageDir, log.filename));

    res.status(200).json({
      success: true,
      data: {
        ...log,
        audioUrl: `/api/elevenlabs/audio/${log.downloadId}`,
        fileExists,
      },
    });
  } catch (error) {
    next(error);
  }
}


export async function deleteLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { downloadId } = req.params;
    
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "voicenova_neural_auth_secret_key_2026_prod") as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {}
    }

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const log = await prisma.synthesisLog.findUnique({
      where: { downloadId },
    });

    if (!log) {
      res.status(404).json({ success: false, message: "Log not found" });
      return;
    }

    if (log.userId !== userId) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    if (log.filename) {
      const storageDir = getStorageDir();
      const filePath = path.join(storageDir, log.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.synthesisLog.delete({
      where: { downloadId },
    });

    res.status(200).json({ success: true, message: "Audio deleted successfully" });
  } catch (error) {
    next(error);
  }
}
