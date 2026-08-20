import Stripe from "stripe";
import { env } from "../config/env";
import prisma from "../config/db";
import logger from "../utils/logger";
import { SubscriptionService, ValidPlanName } from "./subscription.service";
import { EmailService } from "./email.service";

// Initialize Stripe (Mocked or real based on env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_123", {
  apiVersion: "2024-04-10" as any, // latest typings might differ
});

export class StripeService {
  /**
   * Helper to map VoiceNova plans to Stripe Price IDs.
   * In a real environment, you'd map these to environment variables.
   */
  private static getPriceIdForPlan(plan: string, billingCycle: "monthly" | "yearly"): string {
    const map: Record<string, any> = {
      "Starter Plan": { monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || "price_starter_mo", yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || "price_starter_yr" },
      "Pro Plan": { monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_pro_mo", yearly: process.env.STRIPE_PRICE_PRO_YEARLY || "price_pro_yr" },
      "Enterprise": { monthly: process.env.STRIPE_PRICE_ENT_MONTHLY || "price_ent_mo", yearly: process.env.STRIPE_PRICE_ENT_YEARLY || "price_ent_yr" },
    };
    return map[plan]?.[billingCycle] || "price_unknown";
  }

  private static mapPlanFromPriceId(priceId: string): { planName: ValidPlanName; billingCycle: "monthly" | "yearly" } | null {
    const plans: ValidPlanName[] = ["Starter Plan", "Pro Plan", "Enterprise"];
    for (const plan of plans) {
      if (this.getPriceIdForPlan(plan, "monthly") === priceId) return { planName: plan, billingCycle: "monthly" };
      if (this.getPriceIdForPlan(plan, "yearly") === priceId) return { planName: plan, billingCycle: "yearly" };
    }
    return null;
  }

  /**
   * Ensure the user has a Stripe Customer ID
   */
  public static async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe Customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  /**
   * Create Checkout Session
   */
  public static async createCheckoutSession(userId: string, plan: ValidPlanName, billingCycle: "monthly" | "yearly") {
    const customerId = await this.getOrCreateCustomer(userId);
    const priceId = this.getPriceIdForPlan(plan, billingCycle);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/billing`,
      metadata: {
        userId,
        plan,
        billingCycle,
      },
    });

    return session.url;
  }

  /**
   * Create Customer Portal Session
   */
  public static async createPortalSession(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeCustomerId) {
      throw new Error("User is not a Stripe customer yet.");
    }
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${frontendUrl}/billing`,
    });

    return session.url;
  }

  /**
   * Handle incoming Webhooks
   */
  public static async handleWebhook(body: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock123";
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logger.error(`[Stripe Webhook] Verification failed: ${(err as Error).message}`);
      throw new Error(`Webhook Error: ${(err as Error).message}`);
    }

    logger.info(`[Stripe Webhook] Received event: ${event.type}`);

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          logger.info(`[Stripe Webhook] Unhandled event type ${event.type}`);
      }
    } catch (err) {
      logger.error(`[Stripe Webhook] Error processing ${event.type}: ${(err as Error).message}`);
      throw err;
    }
  }

  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const planStr = session.metadata?.plan as ValidPlanName;
    const cycle = session.metadata?.billingCycle as "monthly" | "yearly";
    const subscriptionId = session.subscription as string;

    if (!userId || !planStr || !cycle) {
      logger.error("[Stripe Webhook] checkout.session.completed missing metadata.");
      return;
    }

    // Provision the subscription via SubscriptionService (it handles DB limits & invoice logging)
    const { subscription } = await SubscriptionService.changePlan(userId, planStr, cycle);
    
    // Attach stripe sub ID
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { stripeSubscriptionId: subscriptionId },
    });
    logger.info(`[Stripe Webhook] Provisioned subscription for user ${userId} to ${planStr}.`);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      EmailService.sendSubscriptionActivated(user.email, planStr, subscription.creditLimit).catch(() => {});
    }
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // If the user upgrades/downgrades from portal
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0].price.id;

    const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
    if (!user) return;

    const mapped = this.mapPlanFromPriceId(priceId);
    if (!mapped) return;

    // Update the active subscription
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "Active" },
    });

    if (activeSub && activeSub.stripeSubscriptionId === subscription.id) {
      if (activeSub.plan !== mapped.planName) {
         // Perform standard change plan logic
         await SubscriptionService.changePlan(user.id, mapped.planName, mapped.billingCycle);
      }
    }
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
    if (!user) return;

    await SubscriptionService.cancelSubscription(user.id);
  }

  private static async handleInvoicePaymentSucceeded(invoice: any) {
    if (!invoice.subscription || !invoice.customer) return;

    const customerId = invoice.customer as string;
    const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
    if (!user) return;

    // Log the payment
    const amountPaid = invoice.amount_paid / 100;
    if (amountPaid > 0) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          planName: user.plan,
          amount: amountPaid,
          currency: invoice.currency.toUpperCase(),
          status: "Paid",
          provider: "Stripe",
          transactionId: invoice.payment_intent as string || `inv_${invoice.id}`,
          invoiceUrl: invoice.hosted_invoice_url,
        }
      });
      logger.info(`[Stripe Webhook] Invoice paid: ${amountPaid} ${invoice.currency} for user ${user.id}`);
      EmailService.sendPaymentSuccess(user.email, `${amountPaid} ${invoice.currency.toUpperCase()}`, invoice.hosted_invoice_url || "").catch(() => {});
    }
  }

  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
    if (!user) return;

    // We can notify the user or downgrade their plan here
    logger.warn(`[Stripe Webhook] Payment failed for user ${user.id}.`);
    EmailService.sendPaymentFailed(user.email).catch(() => {});
  }
}
