import fs from "fs";
import path from "path";

// Add to exports in elevenlabs.controller.ts
export async function deleteLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { downloadId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const log = await prisma.synthesisLog.findUnique({
      where: { downloadId },
    });

    if (!log) {
      res.status(404).json({ success: false, message: "Log not found" });
      return;
    }

    if (log.userId !== userId) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    // Try to delete the file if it exists
    if (log.filename) {
      const storageDir = getStorageDir();
      const filePath = path.join(storageDir, log.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from DB
    await prisma.synthesisLog.delete({
      where: { downloadId },
    });

    res.status(200).json({ success: true, message: "Audio deleted successfully" });
  } catch (error) {
    next(error);
  }
}
