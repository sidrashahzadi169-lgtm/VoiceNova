export interface CheckoutRequest {
  userId: string;
  userEmail: string;
  planName: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  paymentUrl: string;
  transactionId: string;
}

export interface WebhookResult {
  status: "success" | "failed" | "ignored";
  transactionId?: string;
  userId?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  errorMessage?: string;
}

export interface PaymentProvider {
  createCheckout(request: CheckoutRequest): Promise<CheckoutResponse>;
  handleWebhook(payload: any, signature: string): Promise<WebhookResult>;
}
