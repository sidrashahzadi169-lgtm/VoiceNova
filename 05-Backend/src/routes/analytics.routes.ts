import { Router } from "express";
import { getUserAnalytics, getAdminAnalytics } from "../controllers/analytics.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Usage telemetry, stats, and dashboard data APIs
 */

/**
 * @swagger
 * /api/analytics/usage:
 *   get:
 *     summary: Retrieve user-specific usage analytics and telemetry
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Usage analytics payload
 *       401:
 *         description: Unauthorized
 */
router.get("/usage", protect, getUserAnalytics);

/**
 * @swagger
 * /api/analytics/admin/overview:
 *   get:
 *     summary: Retrieve platform-wide usage analytics for admins
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Global analytics payload
 *       401:
 *         description: Unauthorized
 */
router.get("/admin/overview", protect, getAdminAnalytics);

export default router;
