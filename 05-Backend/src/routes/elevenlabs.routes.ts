/**
 * @file src/routes/elevenlabs.routes.ts
 * @description Public ElevenLabs integration routes for Studio UI.
 */

import { Router } from "express";
import {
  getElevenLabsVoices,
  getElevenLabsStatus,
  synthesizeDirect,
  streamAudio,
  getHistory,
  getLogByDownloadId,
} from "../controllers/elevenlabs.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ElevenLabs
 *   description: Direct ElevenLabs API integration endpoints
 */

/**
 * @swagger
 * /api/elevenlabs/voices:
 *   get:
 *     summary: Fetch voice catalog directly from ElevenLabs API
 *     tags: [ElevenLabs]
 *     responses:
 *       200:
 *         description: Normalized ElevenLabs voice catalog
 *       403:
 *         description: API key missing required permissions
 */
router.get("/voices", getElevenLabsVoices);

/**
 * @swagger
 * /api/elevenlabs/status:
 *   get:
 *     summary: Check ElevenLabs API key validity and connection status
 *     tags: [ElevenLabs]
 *     responses:
 *       200:
 *         description: Connection status
 */
router.get("/status", getElevenLabsStatus);

/**
 * @swagger
 * /api/elevenlabs/synthesize:
 *   post:
 *     summary: Synthesize speech directly — no DB voice sync required
 *     tags: [ElevenLabs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [voiceId, text]
 *             properties:
 *               voiceId:
 *                 type: string
 *                 description: ElevenLabs voice_id
 *               text:
 *                 type: string
 *                 maxLength: 5000
 *               voiceName:
 *                 type: string
 *                 description: Human-readable name for the filename
 *               stability:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               similarity_boost:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               speed:
 *                 type: number
 *                 minimum: 0.25
 *                 maximum: 4.0
 *     responses:
 *       201:
 *         description: Audio synthesized — returns downloadId and audioUrl
 *       400:
 *         description: Invalid input
 *       403:
 *         description: API key permission error
 *       429:
 *         description: Rate limited
 *       502:
 *         description: ElevenLabs synthesis error
 */
router.post("/synthesize", synthesizeDirect);

/**
 * @swagger
 * /api/elevenlabs/audio/{downloadId}:
 *   get:
 *     summary: Stream / download a synthesized MP3 by download ID
 *     tags: [ElevenLabs]
 *     parameters:
 *       - in: path
 *         name: downloadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: MP3 audio stream
 *       404:
 *         description: File not found
 */
router.get("/audio/:downloadId", streamAudio);

router.get("/history", getHistory);

router.get("/log/:downloadId", getLogByDownloadId);

export default router;

