import prisma from "../config/db";
import logger from "../utils/logger";

export class CreditService {
  /**
   * Check if the user has enough credits to synthesize the requested characters.
   */
  static async hasSufficientCredits(userId: string, requiredChars: number): Promise<boolean> {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: "Active", deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!activeSub) return false;

    // Treat Enterprise with limit 0 or very high limit as unlimited in some contexts,
    // but here we just check mathematically.
    const remaining = activeSub.creditLimit - activeSub.creditUsed;
    return remaining >= requiredChars;
  }

  /**
   * Deducts credits after a successful generation.
   * Throws an error if insufficient.
   */
  static async deductCredits(userId: string, chars: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const activeSub = await tx.subscription.findFirst({
        where: { userId, status: "Active", deletedAt: null },
        orderBy: { createdAt: "desc" },
      });

      if (!activeSub) {
        throw new Error("No active subscription found to deduct credits.");
      }

      if (activeSub.creditLimit - activeSub.creditUsed < chars) {
        throw new Error(`Insufficient credits. Required: ${chars}, Available: ${activeSub.creditLimit - activeSub.creditUsed}`);
      }

      await tx.subscription.update({
        where: { id: activeSub.id },
        data: {
          creditUsed: {
            increment: chars
          }
        }
      });
    });

    logger.info(`[CreditService] Deducted ${chars} credits for user ${userId}.`);
  }

  /**
   * Add bonus credits directly to the user's active subscription limit.
   */
  static async addBonusCredits(userId: string, amount: number): Promise<void> {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: "Active", deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!activeSub) {
      throw new Error("No active subscription found to add credits.");
    }

    await prisma.subscription.update({
      where: { id: activeSub.id },
      data: {
        creditLimit: {
          increment: amount
        }
      }
    });

    logger.info(`[CreditService] Added ${amount} bonus credits for user ${userId}.`);
  }

  /**
   * Returns current credit stats for UI
   */
  static async getCreditStats(userId: string) {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: "Active", deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!activeSub) {
      return { limit: 0, used: 0, remaining: 0 };
    }

    return {
      limit: activeSub.creditLimit,
      used: activeSub.creditUsed,
      remaining: Math.max(0, activeSub.creditLimit - activeSub.creditUsed)
    };
  }
}
