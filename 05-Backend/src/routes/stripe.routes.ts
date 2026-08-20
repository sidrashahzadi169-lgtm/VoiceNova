import { Router } from "express";
import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { createCheckout, createPortal, webhook } from "../controllers/stripe.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Stripe payments and subscription webhooks
 */

/**
 * @swagger
 * /api/stripe/create-checkout-session:
 *   post:
 *     summary: Initiate a Stripe Checkout session for a new subscription
 *     tags: [Payments]
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
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *     responses:
 *       200:
 *         description: Checkout session URL
 *       401:
 *         description: Unauthorized
 */
router.post("/create-checkout-session", protect, createCheckout);

/**
 * @swagger
 * /api/stripe/create-portal-session:
 *   post:
 *     summary: Initiate a Stripe Customer Portal session for managing billing
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Portal session URL
 *       401:
 *         description: Unauthorized
 */
router.post("/create-portal-session", protect, createPortal);

/**
 * @swagger
 * /api/stripe/webhook:
 *   post:
 *     summary: Stripe webhook endpoint (Raw Body)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Received
 */
// MUST use raw body for stripe signature verification to work!
router.post("/webhook", express.raw({ type: "application/json" }), webhook);

export default router;
