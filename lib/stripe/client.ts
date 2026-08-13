import Stripe from "stripe";

import type { Currency } from "@/lib/currency/config";

import { getStripeSecretKey } from "./config";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }
  return stripeClient;
}

export type CheckoutLineItem = {
  name: string;
  quantity: number;
  /** Decimal amount in `currency` (e.g. 45.99), not cents — converted internally. */
  unitAmount: number;
};

export async function createCheckoutSession(params: {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  currency: Currency;
  lineItems: CheckoutLineItem[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.customerEmail,
    line_items: params.lineItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: params.currency.toLowerCase(),
        unit_amount: Math.round(item.unitAmount * 100),
        product_data: { name: item.name },
      },
    })),
    metadata: {
      payment_id: params.paymentId,
      order_id: params.orderId,
      order_number: params.orderNumber,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return { url: session.url, sessionId: session.id };
}
