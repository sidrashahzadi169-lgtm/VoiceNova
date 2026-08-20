import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import fs from "fs";
import path from "path";

const settingsPath = path.join(__dirname, "../../data/settings.json");

export async function getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!fs.existsSync(settingsPath)) {
      res.status(200).json({ success: true, data: {} });
      return;
    }
    const data = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const newSettings = req.body;
    let current = {};
    if (fs.existsSync(settingsPath)) {
      current = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    }
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2));
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
