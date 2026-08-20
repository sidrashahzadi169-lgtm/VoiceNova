import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { StripeService } from "../services/stripe.service";
import logger from "../utils/logger";
import { ValidPlanName } from "../services/subscription.service";

/**
 * POST /api/stripe/create-checkout-session
 */
export async function createCheckout(
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

    const { plan, billingCycle } = req.body as { plan: string; billingCycle: "monthly" | "yearly" };

    const validMap: Record<string, ValidPlanName> = {
      "Starter": "Starter Plan",
      "Pro": "Pro Plan",
      "Enterprise": "Enterprise"
    };
    
    const planLabel = validMap[plan];
    if (!planLabel) {
      res.status(400).json({ success: false, message: "Invalid plan specified for checkout." });
      return;
    }

    const url = await StripeService.createCheckoutSession(userId, planLabel, billingCycle);

    res.status(200).json({ success: true, url });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/stripe/create-portal-session
 */
export async function createPortal(
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

    const url = await StripeService.createPortalSession(userId);

    res.status(200).json({ success: true, url });
  } catch (error) {
    if ((error as Error).message.includes("not a Stripe customer")) {
      res.status(400).json({ success: false, message: (error as Error).message });
      return;
    }
    next(error);
  }
}

/**
 * POST /api/stripe/webhook
 * Handled as express.raw() in routes to ensure signature validation works.
 */
export async function webhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).send("Missing stripe-signature header");
      return;
    }

    // req.body is a Buffer here because of express.raw() in the router mapping
    await StripeService.handleWebhook(req.body, signature as string);

    // Return 200 to acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    logger.error(`[Stripe Controller] Webhook Error: ${(error as Error).message}`);
    // Return 400 to Stripe so it knows the webhook failed
    res.status(400).send(`Webhook Error: ${(error as Error).message}`);
  }
}
