import { Router } from "express";
import { savePaymentMethod, subscribe, getBillingInfo, downloadInvoice } from "../controllers/payment.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Setup payment cards, update plans subscriptions, and fetch invoices
 */

/**
 * @swagger
 * /api/payments/info:
 *   get:
 *     summary: Retrieve active user billing summary
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Active plan and transactions list returned
 */
router.get("/info", protect, getBillingInfo);

/**
 * @swagger
 * /api/payments/save-method:
 *   post:
 *     summary: Register secure card details
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - cardBrand
 *               - cardLast4
 *             properties:
 *               token:
 *                 type: string
 *               cardBrand:
 *                 type: string
 *               cardLast4:
 *                 type: string
 *               cardExpMonth:
 *                 type: integer
 *               cardExpYear:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Card registered successfully
 */
router.post("/save-method", protect, savePaymentMethod);

/**
 * @swagger
 * /api/payments/subscribe:
 *   post:
 *     summary: Upgrade subscription plan
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planName
 *               - billingCycle
 *             properties:
 *               planName:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upgraded successfully
 *       400:
 *         description: Missing method or parameters
 */
router.post("/subscribe", protect, subscribe);

/**
 * @swagger
 * /api/payments/invoice/{invoiceNum}:
 *   get:
 *     summary: Download paid invoice PDF
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceNum
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice document returned
 */
router.get("/invoice/:invoiceNum", protect, downloadInvoice);

export default router;
