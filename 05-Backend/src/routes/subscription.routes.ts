import { Router } from "express";
import { 
  getSubscriptionStatus, 
  changePlan, 
  cancelSubscription,
  getAllSubscriptions,
  overrideUserPlan
} from "../controllers/subscription.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Plan management, credit limits, upgrades/downgrades, and cancellation APIs
 */

/**
 * @swagger
 * /api/subscriptions/status:
 *   get:
 *     summary: Retrieve active subscription plan details and credit quotas
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Active subscription details returned
 *       401:
 *         description: Unauthorized
 */
router.get("/status", protect, getSubscriptionStatus);

/**
 * @swagger
 * /api/subscriptions/change-plan:
 *   post:
 *     summary: Upgrade or downgrade active plan tier
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan, billingCycle]
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [Free, Starter, Pro, Enterprise]
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       400:
 *         description: Invalid fields
 *       401:
 *         description: Unauthorized
 */
router.post("/change-plan", protect, changePlan);

/**
 * @swagger
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancel auto-renewal of subscription
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Auto-renewal cancelled
 *       400:
 *         description: No active paid plan
 *       401:
 *         description: Unauthorized
 */
router.post("/cancel", protect, cancelSubscription);

/**
 * @swagger
 * /api/subscriptions/admin/all:
 *   get:
 *     summary: Admin - Get all subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subscriptions
 *       401:
 *         description: Unauthorized
 */
router.get("/admin/all", protect, getAllSubscriptions);

/**
 * @swagger
 * /api/subscriptions/admin/override:
 *   post:
 *     summary: Admin - Override a user's subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetUserId, plan]
 *             properties:
 *               targetUserId:
 *                 type: string
 *               plan:
 *                 type: string
 *                 enum: [Free, Starter, Pro, Enterprise]
 *               billingCycle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       400:
 *         description: Invalid fields
 *       401:
 *         description: Unauthorized
 */
router.post("/admin/override", protect, overrideUserPlan);

export default router;
