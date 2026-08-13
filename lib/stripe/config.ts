export class StripeConfigError extends Error {
  constructor(missing: string) {
    super(`Stripe is not fully configured: missing ${missing}.`);
    this.name = "StripeConfigError";
  }
}

export function getStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new StripeConfigError("STRIPE_SECRET_KEY");
  return secretKey;
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new StripeConfigError("STRIPE_WEBHOOK_SECRET");
  return webhookSecret;
}
