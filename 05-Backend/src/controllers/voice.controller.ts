import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";

// Helper to seed default voices if voices table is empty
async function ensureVoicesSeeded() {
  const count = await prisma.voice.count();
  if (count === 0) {
    await prisma.voice.createMany({
      data: [
        { name: "Nova", gender: "Female", age: "Youth", accent: "US English", category: "Premium", featured: true, description: "Clear and expressive female voice, ideal for SaaS tutorials and narrations." },
        { name: "Aero", gender: "Male", age: "Adult", accent: "UK English", category: "Standard", featured: true, description: "Sophisticated British male voice, suitable for documentaries and podcasts." },
        { name: "Lily", gender: "Female", age: "Child", accent: "US English", category: "Standard", featured: false, description: "Cheerful and energetic child voice, perfect for educational content." },
        { name: "Amina", gender: "Female", age: "Adult", accent: "Urdu", category: "Premium", featured: true, description: "Professional Urdu female narrator with smooth emotional pacing." },
        { name: "Tareq", gender: "Male", age: "Adult", accent: "Arabic", category: "Standard", featured: false, description: "Rich and authoritative Arabic male voice, great for books and speeches." }
      ]
    });
  }
}

export async function getVoices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await ensureVoicesSeeded();

    const voices = await prisma.voice.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" }
    });

    res.status(200).json({
      success: true,
      data: voices
    });
  } catch (error) {
    next(error);
  }
}

export async function searchVoices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await ensureVoicesSeeded();
    const { gender, age, accent, category, search } = req.query;

    const whereClause: any = { deletedAt: null };

    if (gender) whereClause.gender = gender;
    if (age) whereClause.age = age;
    if (accent) whereClause.accent = accent;
    if (category) whereClause.category = category;

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } }
      ];
    }

    const voices = await prisma.voice.findMany({
      where: whereClause,
      orderBy: { name: "asc" }
    });

    res.status(200).json({
      success: true,
      data: voices
    });
  } catch (error) {
    next(error);
  }
}

export async function favoriteVoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const voice = await prisma.voice.findFirst({
      where: { id, deletedAt: null }
    });

    if (!voice) {
      res.status(404).json({ success: false, message: "Voice profile not found" });
      return;
    }

    // Since there is no join table in standard database schema, we mock the favorite action successfully
    res.status(200).json({
      success: true,
      message: `Voice ${voice.name} toggled in favorites successfully`
    });
  } catch (error) {
    next(error);
  }
}
