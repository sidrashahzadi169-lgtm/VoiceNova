import { PaymentProvider } from "./PaymentProvider";
import { EasypaisaProvider } from "./EasypaisaProvider";
import { StripeProvider } from "./StripeProvider";

export class PaymentFactory {
  public static getProvider(gateway: string): PaymentProvider {
    switch (gateway.toLowerCase()) {
      case "easypaisa":
        return new EasypaisaProvider();
      case "stripe":
      case "international":
        return new StripeProvider();
      default:
        throw new Error("Unsupported payment gateway: " + gateway);
    }
  }
}
