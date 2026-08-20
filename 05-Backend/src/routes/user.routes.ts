import { Router } from "express";
import { getProfile, updateProfile, deleteAccount } from "../controllers/user.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Profile viewing, details updating, and account soft deleting
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Retrieve active user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details returned
 *       401:
 *         description: Unauthorized token
 */
router.get("/profile", protect, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update profile name
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Morgan Updated
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", protect, updateProfile);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Soft delete user account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account soft deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/account", protect, deleteAccount);

export default router;
