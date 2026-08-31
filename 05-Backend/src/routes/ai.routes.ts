import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { generateScript } from "../controllers/ai.controller";

const router = Router();

/**
 * @swagger
 * /api/ai/generate-script:
 *   post:
 *     summary: Generate a script using AI
 *     tags: [AI]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt]
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated script
 *       400:
 *         description: Missing prompt
 *       401:
 *         description: Unauthorized
 */
router.post("/generate-script", protect, generateScript);

export default router;
