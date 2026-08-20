import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";

export async function createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id!;
    const { name, scriptText } = req.body;

    if (!name || !scriptText) {
      res.status(400).json({ success: false, message: "Project name and script text are required" });
      return;
    }

    const project = await prisma.project.create({
      data: {
        userId,
        name: name.trim(),
        scriptText,
        charCount: scriptText.length,
        status: "Draft"
      }
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id!;

    const projects = await prisma.project.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" }
    });

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    const { name, scriptText, status } = req.body;

    const project = await prisma.project.findFirst({
      where: { id, userId, deletedAt: null }
    });

    if (!project) {
      res.status(404).json({ success: false, message: "Project not found or unauthorized" });
      return;
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name.trim();
    if (scriptText !== undefined) {
      updatedData.scriptText = scriptText;
      updatedData.charCount = scriptText.length;
    }
    if (status !== undefined) updatedData.status = status;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updatedData
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: { id, userId, deletedAt: null }
    });

    if (!project) {
      res.status(404).json({ success: false, message: "Project not found or unauthorized" });
      return;
    }

    // Soft delete the project
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.status(200).json({
      success: true,
      message: "Project soft deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}
