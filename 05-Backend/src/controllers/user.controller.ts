import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        status: true,
        verified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User profile not found" });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      res.status(400).json({ success: false, message: "Name is required" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        verified: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;

    // Soft delete the user by updating deletedAt field
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    });

    res.status(200).json({
      success: true,
      message: "Account soft deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

import crypto from "crypto";
// Add to end of user.controller.ts
export async function updatePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const oldHash = crypto.pbkdf2Sync(oldPassword, user.salt, 1000, 64, "sha512").toString("hex");
    if (oldHash !== user.hash) {
      res.status(400).json({ success: false, message: "Incorrect old password" });
      return;
    }

    const newSalt = crypto.randomBytes(16).toString("hex");
    const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 1000, 64, "sha512").toString("hex");

    await prisma.user.update({
      where: { id: userId },
      data: { hash: newHash, salt: newSalt },
    });

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getApiKeys(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const keys = await prisma.aPIKey.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, name: true, maskedKey: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: keys });
  } catch (error) {
    next(error);
  }
}

export async function createApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name } = req.body;
    const rawKey = "vn_live_" + crypto.randomBytes(24).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const maskedKey = "vn_live_..." + rawKey.slice(-4);

    const apiKey = await prisma.aPIKey.create({
      data: {
        userId,
        name: name || "Default Key",
        keyHash,
        maskedKey,
      }
    });

    res.status(201).json({
      success: true,
      message: "API Key generated successfully. Copy it now, it won't be shown again.",
      data: {
        id: apiKey.id,
        name: apiKey.name,
        maskedKey: apiKey.maskedKey,
        rawKey
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const { keyId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const key = await prisma.aPIKey.findUnique({ where: { id: keyId } });
    if (!key || key.userId !== userId) {
      res.status(404).json({ success: false, message: "Key not found" });
      return;
    }

    await prisma.aPIKey.update({
      where: { id: keyId },
      data: { deletedAt: new Date(), active: false }
    });

    res.status(200).json({ success: true, message: "API Key revoked successfully" });
  } catch (error) {
    next(error);
  }
}
