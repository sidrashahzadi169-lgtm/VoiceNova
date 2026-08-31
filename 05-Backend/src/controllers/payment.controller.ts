import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";

// Plan quotas mapping
const PLAN_LIMITS: { [key: string]: number } = {
  "Free": 10000,
  "Starter": 50000,
  "Pro": 150000,
  "Business": 1000000,
  "Free Plan": 10000,
  "Starter Plan": 50000,
  "Pro Plan": 150000,
  "Business Plan": 1000000,
};

// Plan price mapping (monthly)
const PLAN_PRICES: { [key: string]: { monthly: number; yearly: number } } = {
  "Free": { monthly: 0, yearly: 0 },
  "Starter": { monthly: 9, yearly: 7 },
  "Pro": { monthly: 29, yearly: 23 },
  "Business": { monthly: 99, yearly: 79 },
};

/**
 * Save user payment method securely (simulating Stripe saving)
 */
export async function savePaymentMethod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id!;
    const { token, cardBrand, cardLast4, cardExpMonth, cardExpYear } = req.body;

    if (!token || !cardBrand || !cardLast4) {
      res.status(400).json({ success: false, message: "Card token details are required" });
      return;
    }

    // Support test cards error handling
    if (cardLast4 === "0000") {
      res.status(400).json({ success: false, message: "Stripe declined this payment method. Expired or blocked card." });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 10)}`,
        cardBrand,
        cardLast4,
        cardExpMonth: parseInt(cardExpMonth) || 12,
        cardExpYear: parseInt(cardExpYear) || 2028
      }
    });

    res.status(200).json({
      success: true,
      message: "Payment method configured successfully",
      data: {
        cardBrand: updatedUser.cardBrand,
        cardLast4: updatedUser.cardLast4,
        cardExpMonth: updatedUser.cardExpMonth,
        cardExpYear: updatedUser.cardExpYear
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle subscription upgrades/downgrades with Stripe Test payment validation
 */
export async function subscribe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id!;
    const { planName, billingCycle } = req.body;

    if (!planName || !billingCycle) {
      res.status(400).json({ success: false, message: "planName and billingCycle are required" });
      return;
    }

    // Retrieve user and their configured card
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.cardLast4) {
      res.status(400).json({ success: false, message: "No payment method configured. Please add a card first." });
      return;
    }

    const normalizedPlan = planName.replace(" Plan", "");
    const prices = PLAN_PRICES[normalizedPlan];
    
    if (!prices) {
      res.status(400).json({ success: false, message: "Invalid plan name" });
      return;
    }

    const priceVal = billingCycle === "yearly" ? prices.yearly * 12 : prices.monthly;

    // Simulate payment failures and cancellations
    if (user.cardLast4 === "0002") {
      res.status(402).json({ success: false, message: "Transaction Failed: Your card has insufficient funds." });
      return;
    }

    if (user.cardLast4 === "0003") {
      res.status(400).json({ success: false, message: "Transaction Cancelled: Payment authorization was cancelled by the user." });
      return;
    }

    // 1. Update user active plan
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan: `${normalizedPlan} Plan` }
    });

    // 2. Upsert subscription limits
    const limit = PLAN_LIMITS[normalizedPlan] || 10000;
    const existingSub = await prisma.subscription.findFirst({
      where: { userId, deletedAt: null }
    });

    const isExpiredSimulator = user.cardLast4 === "0001";
    const subEndDate = isExpiredSimulator 
      ? new Date(Date.now() - 3600 * 1000) // 1 hour ago (Expired!)
      : new Date(Date.now() + 30 * 24 * 3600 * 1000);

    if (existingSub) {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan: `${normalizedPlan} Plan`,
          creditLimit: limit,
          creditUsed: 0, // Reset character usage for new plan cycle
          startDate: new Date(),
          endDate: subEndDate
        }
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          plan: `${normalizedPlan} Plan`,
          status: "Active",
          creditLimit: limit,
          creditUsed: 0,
          startDate: new Date(),
          endDate: subEndDate
        }
      });
    }

    // 3. Generate invoice record
    const invoiceNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const payment = await prisma.payment.create({
      data: {
        userId,
        planName: `${normalizedPlan} Plan`,
        amount: priceVal,
        currency: "USD",
        status: "Paid",
        provider: "Stripe",
        transactionId: `ch_${Math.random().toString(36).substring(2, 12)}`,
        invoiceUrl: `/api/payments/invoice/${invoiceNum}`
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${normalizedPlan} Plan!`,
      data: {
        plan: updatedUser.plan,
        payment,
        invoiceNum
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch billing dashboard details
 */
export async function getBillingInfo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        plan: true,
        cardBrand: true,
        cardLast4: true,
        cardExpMonth: true,
        cardExpYear: true
      }
    });

    let subscription = await prisma.subscription.findFirst({
      where: { userId, deletedAt: null }
    });

    // Handle Expiry & Warning Notifications
    if (subscription) {
      const now = new Date();

      // 1. Auto-downgrade expired subscriptions to Free Plan
      if (subscription.status === "Active" && now > subscription.endDate) {
        subscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "Expired" }
        });

        await prisma.user.update({
          where: { id: userId },
          data: { plan: "Free Plan" }
        });

        // Generate Expiry notification
        await prisma.notification.create({
          data: {
            userId,
            title: "Subscription Expired",
            message: "Your premium subscription cycle has expired and reverted to the Free plan. Renew your subscription to restore service access."
          }
        });
      }
      // 2. Expiration Warning notification (notify user 3 days or less before expiration)
      else if (subscription.status === "Active") {
        const diffMs = subscription.endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 3 && diffDays > 0) {
          const recentWarning = await prisma.notification.findFirst({
            where: {
              userId,
              title: "Subscription Expiration Warning",
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // within last 24 hours
              }
            }
          });

          if (!recentWarning) {
            await prisma.notification.create({
              data: {
                userId,
                title: "Subscription Expiration Warning",
                message: `Your premium VoiceNova plan is expiring in ${diffDays} day(s). Renew soon to keep your voice synthesis quotas active.`
              }
            });
          }
        }
      }
    }

    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        plan: true,
        cardBrand: true,
        cardLast4: true,
        cardExpMonth: true,
        cardExpYear: true
      }
    });

    const payments = await prisma.payment.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({
      success: true,
      data: {
        user: finalUser,
        subscription,
        payments
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Download Invoice generator endpoint
 */
export async function downloadInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { invoiceNum } = req.params;

    res.setHeader("Content-Disposition", `attachment; filename="${invoiceNum}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    
    const pdfContent = "%PDF-1.1\n" +
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\nendobj\n" +
      "4 0 obj\n<< /Length 57 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(VoiceNova Billing Invoice - Paid) Tj\nET\nendstream\nendobj\n" +
      "xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000055 00000 n \n0000000107 00000 n \n0000000258 00000 n \n" +
      "trailer << /Size 5 /Root 1 0 R >>\nstartxref\n371\n%%EOF\n";

    const dummyPdf = Buffer.from(pdfContent, "utf-8");
    res.send(dummyPdf);
  } catch (error) {
    next(error);
  }
}


import { PaymentFactory } from "../services/payment/PaymentFactory";

export async function createCheckoutSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id!;
    const { planName, gateway } = req.body; // gateway = "easypaisa" | "international"

    if (!planName || !gateway) {
      res.status(400).json({ success: false, message: "planName and gateway are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Determine amount
    const amountMap: Record<string, number> = {
      "Starter Plan": 9.0,
      "Pro Plan": 29.0,
      "Business": 99.0,
      "Enterprise": 99.0
    };
    const amount = amountMap[planName] || 9.0;

    try {
      const provider = PaymentFactory.getProvider(gateway);
      
      const successUrl = process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL + "/payment-success"
        : "http://localhost:3000/payment-success";
        
      const cancelUrl = process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL + "/payment-failed"
        : "http://localhost:3000/payment-failed";

      const checkoutResponse = await provider.createCheckout({
        userId,
        userEmail: user.email,
        planName,
        amount,
        currency: gateway === "easypaisa" ? "PKR" : "USD",
        successUrl,
        cancelUrl
      });

      res.status(200).json({ success: true, data: checkoutResponse });
    } catch (providerError: any) {
      if (providerError.message.includes("MISSING_CONFIG")) {
        res.status(503).json({ 
          success: false, 
          message: providerError.message,
          error_code: "MISSING_GATEWAY_CONFIG"
        });
      } else {
        throw providerError;
      }
    }
  } catch (error) {
    next(error);
  }
}

export async function handlePaymentWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { gateway } = req.params;
    const provider = PaymentFactory.getProvider(gateway);
    const signature = req.headers["x-signature"] as string || ""; // Placeholder for actual header

    const result = await provider.handleWebhook(req.body, signature);

    if (result.status === "ignored") {
      res.status(200).json({ received: true });
      return;
    }

    if (result.status === "failed") {
      res.status(200).json({ received: true, status: "Payment failed logged" });
      return;
    }

    // Process successful payment
    if (result.status === "success" && result.userId && result.planName) {
      // Prevent duplicate processing
      const existing = await prisma.payment.findUnique({ where: { transactionId: result.transactionId! } });
      if (existing) {
        res.status(200).json({ received: true, status: "Already processed" });
        return;
      }

      await prisma.payment.create({
        data: {
          userId: result.userId,
          amount: result.amount || 0,
          currency: result.currency || "USD",
          status: "Paid",
          provider: gateway,
          transactionId: result.transactionId!
        }
      });

      // Update subscription
      const user = await prisma.user.update({
        where: { id: result.userId },
        data: { plan: result.planName }
      });

      await prisma.subscription.updateMany({
        where: { userId: user.id, status: "Active" },
        data: { status: "Canceled" }
      });

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: result.planName,
          status: "Active",
          creditLimit: 500000,
          creditUsed: 0,
          startDate: new Date(),
          endDate: nextMonth
        }
      });
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    if (error.message.includes("MISSING_CONFIG")) {
      res.status(503).json({ success: false, message: "Webhook endpoint not configured" });
    } else {
      next(error);
    }
  }
}
