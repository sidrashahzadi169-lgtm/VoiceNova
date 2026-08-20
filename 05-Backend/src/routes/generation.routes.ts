/**
 * @file src/routes/generation.routes.ts
 * @description Routes for voice generation, history, and file downloads.
 */

import { Router, Request, Response, NextFunction } from "express";
import { generateSpeech, downloadFile, getHistory } from "../controllers/generation.controller";
import { protect } from "../middlewares/auth.middleware";
import { VoiceSyncService } from "../services/VoiceSyncService";
import { AIProviderFactory } from "../providers/AIProviderFactory";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Voice Generations
 *   description: Synthesize speech from text inputs, query history audits, and export audio files
 */

// ─── Generate Speech ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/voice-generations/generate:
 *   post:
 *     summary: Synthesize speech from text using the active AI provider (ElevenLabs)
 *     tags: [Voice Generations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voiceId
 *               - text
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional project to associate this generation with
 *               voiceId:
 *                 type: string
 *                 format: uuid
 *                 description: Internal database Voice UUID (must have providerVoiceId set)
 *               text:
 *                 type: string
 *                 maxLength: 5000
 *                 example: Welcome to VoiceNova. This speech is synthesized by ElevenLabs.
 *               format:
 *                 type: string
 *                 enum: [MP3, WAV]
 *                 default: MP3
 *               quality:
 *                 type: string
 *                 enum: [Standard, High]
 *                 default: Standard
 *               stability:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Voice stability (0=expressive, 100=consistent)
 *               clarity:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Clarity / similarity boost (0=low, 100=high)
 *               speed:
 *                 type: number
 *                 minimum: 0.25
 *                 maximum: 4.0
 *                 description: Playback speed multiplier (note - not directly supported by all providers)
 *     responses:
 *       201:
 *         description: Audio synthesized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     generationId:
 *                       type: string
 *                     duration:
 *                       type: number
 *                     charCount:
 *                       type: integer
 *                     audioUrl:
 *                       type: string
 *                     format:
 *                       type: string
 *                     quality:
 *                       type: string
 *                     voiceName:
 *                       type: string
 *                     provider:
 *                       type: string
 *       400:
 *         description: Invalid input (missing voiceId, text too long, bad format)
 *       403:
 *         description: Insufficient character balance
 *       404:
 *         description: Voice profile not found
 *       422:
 *         description: Voice not linked to a synthesis provider
 *       429:
 *         description: Provider rate limit exceeded
 *       502:
 *         description: Provider synthesis failed
 */
router.post("/generate", protect, generateSpeech);

// ─── Download Audio ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/voice-generations/download/{id}:
 *   get:
 *     summary: Download a generated audio file by generation ID
 *     tags: [Voice Generations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: VoiceGeneration record ID
 *     responses:
 *       200:
 *         description: Audio file binary stream
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Generation not found or file expired
 */
router.get("/download/:id", downloadFile);

// ─── History ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/voice-generations/history:
 *   get:
 *     summary: Retrieve paginated voice generation history
 *     tags: [Voice Generations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Paginated generation history
 *       401:
 *         description: Unauthorized
 */
router.get("/history", protect, getHistory);

// ─── Provider Voices (Admin / Sync) ──────────────────────────────────────────

/**
 * @swagger
 * /api/voice-generations/provider/voices:
 *   get:
 *     summary: List voices directly from the active AI provider
 *     description: Fetches real-time voice catalog from the provider API (e.g. ElevenLabs)
 *     tags: [Voice Generations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Provider voice list
 *       502:
 *         description: Provider API error
 */
router.get("/provider/voices", protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = AIProviderFactory.getProvider();
    const voices = await provider.getVoices();
    res.status(200).json({
      success: true,
      provider: provider.getProviderName(),
      count: voices.length,
      data: voices,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/voice-generations/provider/sync:
 *   post:
 *     summary: Sync AI provider voices to local database
 *     description: Upserts all provider voices into the local Voice table with their providerVoiceId
 *     tags: [Voice Generations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sync results with created/updated/skipped counts
 *       502:
 *         description: Provider API error during sync
 */
router.post("/provider/sync", protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await VoiceSyncService.syncVoices();
    res.status(200).json({
      success: true,
      message: `Voice sync complete from ${result.provider}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/voice-generations/provider/health:
 *   get:
 *     summary: Check AI provider health and API connectivity
 *     tags: [Voice Generations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Provider health status
 */
router.get("/provider/health", protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = AIProviderFactory.getProvider();
    const health = await provider.checkHealth();
    res.status(health.available ? 200 : 503).json({
      success: health.available,
      provider: provider.getProviderName(),
      data: health,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
