import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

async function seedDatabase() {
  try {
    const adminEmail = "admin@voicenova.ai";
    const admin = await prisma.user.findFirst({
      where: { email: adminEmail }
    });

    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("superSecret123", salt);
      await prisma.user.create({
        data: {
          name: "Sidra",
          email: adminEmail,
          salt,
          hash,
          plan: "Pro Plan",
          status: "Active",
          verified: true
        }
      });
      console.log("Database seeded: admin@voicenova.ai created.");
    }
  } catch (err) {
    console.error("Database seeding failed:", err);
  }
}

seedDatabase();

export default prisma;
