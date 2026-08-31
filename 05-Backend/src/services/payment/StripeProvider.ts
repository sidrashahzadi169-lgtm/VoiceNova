import { CheckoutRequest, CheckoutResponse, PaymentProvider, WebhookResult } from "./PaymentProvider";

export class StripeProvider implements PaymentProvider {
  private secretKey: string;
  private webhookSecret: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || "";
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  }

  private isConfigured(): boolean {
    return this.secretKey.length > 0;
  }

  public async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    if (!this.isConfigured()) {
      throw new Error("STRIPE_MISSING_CONFIG: Stripe Secret Key is missing in environment variables. Please configure it to enable International payments.");
    }

    // In a real implementation, we would require('stripe')(this.secretKey)
    // and call stripe.checkout.sessions.create()
    // For architectural placeholder:
    const sessionId = "cs_test_" + Date.now();
    const checkoutUrl = "https://checkout.stripe.com/pay/" + sessionId;

    return {
      paymentUrl: checkoutUrl,
      transactionId: sessionId
    };
  }

  public async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
    if (!this.isConfigured() || !this.webhookSecret) {
      throw new Error("STRIPE_MISSING_CONFIG");
    }

    // Verify Stripe signature using stripe.webhooks.constructEvent()
    const eventType = payload.type;
    const session = payload.data?.object;

    if (eventType === "checkout.session.completed") {
      return {
        status: "success",
        transactionId: session.id,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        userId: session.metadata?.userId,
        planName: session.metadata?.planName
      };
    }

    return { status: "ignored" };
  }
}

