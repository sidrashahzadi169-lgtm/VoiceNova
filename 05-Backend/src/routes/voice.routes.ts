import { Router } from "express";
import { getVoices, searchVoices, favoriteVoice } from "../controllers/voice.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Voices
 *   description: Search, retrieve, and toggle favorites on AI voice catalog profiles
 */

/**
 * @swagger
 * /api/voices:
 *   get:
 *     summary: Retrieve all voice profiles
 *     tags: [Voices]
 *     responses:
 *       200:
 *         description: List of all active voice profiles
 */
router.get("/", getVoices);

/**
 * @swagger
 * /api/voices/search:
 *   get:
 *     summary: Search and filter voice profiles
 *     tags: [Voices]
 *     parameters:
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *       - in: query
 *         name: age
 *         schema:
 *           type: string
 *       - in: query
 *         name: accent
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered list of voice profiles returned
 */
router.get("/search", searchVoices);

/**
 * @swagger
 * /api/voices/{id}/favorite:
 *   post:
 *     summary: Toggle voice profile favorites
 *     tags: [Voices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Favorited toggle successful
 *       404:
 *         description: Voice not found
 */
router.post("/:id/favorite", protect, favoriteVoice);

export default router;
