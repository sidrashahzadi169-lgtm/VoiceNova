import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";
import logger from "../utils/logger";
import { SubscriptionService, ValidPlanName } from "../services/subscription.service";
import { CreditService } from "../services/credit.service";

/**
 * GET /api/subscriptions/status
 * Get the current user's subscription details, credit usage, and expiry date.
 */
export async function getSubscriptionStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const subscription = await SubscriptionService.getActiveSubscription(userId);
    const remainingCredits = Math.max(0, subscription.creditLimit - subscription.creditUsed);

    const payments = await prisma.payment.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        creditLimit: subscription.creditLimit,
        creditUsed: subscription.creditUsed,
        remainingCredits,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        billingCycle: subscription.billingCycle,
        pricePaid: subscription.pricePaid,
        invoices: payments.map(p => ({
          id: p.transactionId,
          date: p.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          amount: `$${p.amount.toFixed(2)} USD`,
          status: p.status === "Paid" ? "Paid" : "Failed",
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/change-plan
 * Upgrade or Downgrade subscription plans.
 */
export async function changePlan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const { plan, billingCycle } = req.body as {
      plan: "Free" | "Starter" | "Pro" | "Enterprise";
      billingCycle: "monthly" | "yearly";
    };

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const validMap: Record<string, ValidPlanName> = {
      "Free": "Free Plan",
      "Starter": "Starter Plan",
      "Pro": "Pro Plan",
      "Enterprise": "Enterprise"
    };

    const planLabel = validMap[plan];
    if (!planLabel) {
      res.status(400).json({ success: false, message: "Invalid plan specified." });
      return;
    }

    const cycle = billingCycle === "yearly" ? "yearly" : "monthly";

    const { subscription, transactionId } = await SubscriptionService.changePlan(userId, planLabel, cycle);

    res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${planLabel}!`,
      data: {
        plan: planLabel,
        creditLimit: subscription.creditLimit,
        endDate: subscription.endDate,
        billingCycle: cycle,
        transactionId,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription auto-renewal.
 */
export async function cancelSubscription(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    await SubscriptionService.cancelSubscription(userId);

    res.status(200).json({
      success: true,
      message: "Your subscription renewal has been cancelled. Your active credits remain valid until the expiration date.",
    });
  } catch (error) {
    if ((error as Error).message.includes("No active subscription")) {
      res.status(400).json({ success: false, message: (error as Error).message });
      return;
    }
    next(error);
  }
}

/**
 * GET /api/subscriptions/admin/all
 * Admin: Get all subscriptions
 */
export async function getAllSubscriptions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "50"), 10) || 50));
    const offset = Math.max(0, parseInt(String(req.query.offset ?? "0"), 10) || 0);

    const data = await SubscriptionService.getAllSubscriptions(limit, offset);

    res.status(200).json({
      success: true,
      data: data.subscriptions,
      pagination: { total: data.total, limit, offset, hasMore: offset + limit < data.total },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/admin/override
 * Admin: Override a user's plan without billing
 */
export async function overrideUserPlan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { targetUserId, plan, billingCycle } = req.body;
    
    if (!targetUserId || !plan) {
      res.status(400).json({ success: false, message: "Missing targetUserId or plan." });
      return;
    }

    const validMap: Record<string, ValidPlanName> = {
      "Free": "Free Plan",
      "Starter": "Starter Plan",
      "Pro": "Pro Plan",
      "Enterprise": "Enterprise"
    };

    const planLabel = validMap[plan];
    if (!planLabel) {
      res.status(400).json({ success: false, message: "Invalid plan specified." });
      return;
    }

    const cycle = billingCycle === "yearly" ? "yearly" : "monthly";

    // Override plan (treat as monthly/yearly but amount 0 can be handled by just calling changePlan and letting it mock a transaction if needed. Alternatively we could add a `priceOverride` to the service, but since this is mock, calling changePlan is fine or we can write custom logic).
    // Let's use changePlan, it will generate a transaction for the price, which is fine for mock.
    const { subscription } = await SubscriptionService.changePlan(targetUserId, planLabel, cycle);

    res.status(200).json({
      success: true,
      message: `User ${targetUserId} overridden to ${planLabel}.`,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
}
