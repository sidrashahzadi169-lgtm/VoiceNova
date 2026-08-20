import { Router } from "express";
import { createProject, getProjects, updateProject, deleteProject } from "../controllers/project.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Create, view, modify, and delete voice synthesis projects
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project script
 *     tags: [Projects]
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
 *               - scriptText
 *             properties:
 *               name:
 *                 type: string
 *                 example: My First AI Podcast
 *               scriptText:
 *                 type: string
 *                 example: Hello and welcome to VoiceNova, the deep neural audio generator.
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Name and script text are required
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Retrieve user projects list
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update an existing project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               scriptText:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Draft, Completed]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found or unauthorized
 */
router.put("/:id", protect, updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Soft delete a project
 *     tags: [Projects]
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
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete("/:id", protect, deleteProject);

export default router;
