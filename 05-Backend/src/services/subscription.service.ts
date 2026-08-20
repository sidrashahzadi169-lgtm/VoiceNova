import prisma from "../config/db";
import logger from "../utils/logger";
import path from "path";
import fs from "fs";
import { EmailService } from "./email.service";

export const PLAN_LIMITS = {
  "Free Plan": {
    chars: 10000,
    priceMonthly: 0,
    priceYearly: 0,
  },
  "Starter Plan": {
    chars: 50000,
    priceMonthly: 9.0,
    priceYearly: 7.0, // 84 / yr
  },
  "Pro Plan": {
    chars: 150000,
    priceMonthly: 29.0,
    priceYearly: 23.0, // 276 / yr
  },
  "Enterprise": {
    chars: 10000000,
    priceMonthly: 99.0,
    priceYearly: 79.0, // 948 / yr
  }
};

export type ValidPlanName = "Free Plan" | "Starter Plan" | "Pro Plan" | "Enterprise";

export class SubscriptionService {
  /**
   * Get active subscription or provision default Free Plan
   */
  static async getActiveSubscription(userId: string) {
    let subscription = await prisma.subscription.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          plan: "Free Plan",
          status: "Active",
          creditLimit: PLAN_LIMITS["Free Plan"].chars,
          creditUsed: 0,
          endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          billingCycle: "monthly",
          pricePaid: 0.0,
        },
      });
      await prisma.user.update({ where: { id: userId }, data: { plan: "Free Plan" } });
    }

    // Check expiry
    if (subscription.status === "Active" && new Date() > subscription.endDate) {
      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "Expired" },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { plan: "Free Plan" },
      });
    }

    return subscription;
  }

  /**
   * Change user plan (Upgrade / Downgrade)
   */
  static async changePlan(userId: string, planName: ValidPlanName, billingCycle: "monthly" | "yearly") {
    const limits = PLAN_LIMITS[planName];
    if (!limits) {
      throw new Error(`Invalid plan name: ${planName}`);
    }

    const priceRate = billingCycle === "yearly" ? limits.priceYearly : limits.priceMonthly;
    const totalAmount = billingCycle === "yearly" ? priceRate * 12 : priceRate;
    const expiryDays = billingCycle === "yearly" ? 365 : 30;
    const endDate = new Date(Date.now() + expiryDays * 24 * 3600 * 1000);
    const transactionId = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newSub = await prisma.$transaction(async (tx) => {
      // Deactivate old
      await tx.subscription.updateMany({
        where: { userId, status: "Active", deletedAt: null },
        data: { deletedAt: new Date(), status: "Cancelled" },
      });

      // Create new
      const sub = await tx.subscription.create({
        data: {
          userId,
          plan: planName,
          status: "Active",
          creditLimit: limits.chars,
          creditUsed: 0,
          startDate: new Date(),
          endDate,
          billingCycle,
          pricePaid: totalAmount,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { plan: planName },
      });

      if (totalAmount > 0) {
        await tx.payment.create({
          data: {
            userId,
            planName,
            amount: totalAmount,
            currency: "USD",
            status: "Paid",
            provider: "Stripe",
            transactionId,
          },
        });
      }

      // Fetch user to send email
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user && user.email) {
        EmailService.sendSubscriptionActivated(user.email, planName, limits.chars).catch(() => {});
      }

      return sub;
    });

    logger.info(`[SubscriptionService] User ${userId} changed to ${planName} (${billingCycle}). Limit: ${limits.chars}`);

    return { subscription: newSub, transactionId: totalAmount > 0 ? transactionId : null };
  }

  /**
   * Cancel subscription auto-renewal
   */
  static async cancelSubscription(userId: string) {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: "Active", deletedAt: null },
    });

    if (!activeSub) {
      throw new Error("No active subscription found to cancel.");
    }

    await prisma.subscription.update({
      where: { id: activeSub.id },
      data: { status: "Cancelled" },
    });

    logger.info(`[SubscriptionService] Subscription cancelled for user ${userId}.`);
  }

  /**
   * Admin: Get all subscriptions
   */
  static async getAllSubscriptions(limit: number = 50, offset: number = 0) {
    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.subscription.count()
    ]);
    return { subscriptions, total };
  }
}
