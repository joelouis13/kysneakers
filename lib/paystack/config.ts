export class PaystackConfigError extends Error {
  constructor(missing: string) {
    super(`Paystack is not fully configured: missing ${missing}.`);
    this.name = "PaystackConfigError";
  }
}

export function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new PaystackConfigError("PAYSTACK_SECRET_KEY");
  return key;
}

/**
 * Ghana Mobile Money checkout routes through Paystack once a secret key is
 * configured (test or live) — until then it falls back to Moolre, so adding
 * the key is the deliberate "go live with Paystack" switch, not a separate
 * flag to remember to flip. See lib/checkout/actions.ts's provider dispatch.
 */
export function isPaystackConfigured(): boolean {
  return !!process.env.PAYSTACK_SECRET_KEY;
}
