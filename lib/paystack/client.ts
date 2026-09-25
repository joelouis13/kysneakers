import { getPaystackSecretKey } from "./config";
import type { PaystackChargeResponse, PaystackMobileMoneyProvider, PaystackVerifyResponse } from "./types";
import type { PaymentMethod } from "@/types/database";

const BASE_URL = "https://api.paystack.co";

export function mobileMoneyProviderForMethod(method: PaymentMethod): PaystackMobileMoneyProvider {
  switch (method) {
    case "mtn_momo":
      return "mtn";
    // Paystack still identifies this network by its pre-rebrand "vod"
    // (Vodafone) provider code — Telecel Cash is the same network.
    case "telecel_cash":
      return "vod";
    case "airteltigo_money":
      return "atl";
    case "card":
      throw new Error("mobileMoneyProviderForMethod called with 'card' — Stripe handles card payments, not Paystack.");
  }
}

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getPaystackSecretKey()}`,
  };
}

/** Throws only on genuine network/config failure; a declined/failed charge is a normal typed response, not a throw. */
export async function initiateMobileMoneyCharge(params: {
  email: string;
  amountGhs: number;
  phone: string;
  provider: PaystackMobileMoneyProvider;
  reference: string;
}): Promise<PaystackChargeResponse> {
  const response = await fetch(`${BASE_URL}/charge`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: params.email,
      // Paystack amounts are in the currency's smallest unit (pesewas for GHS).
      amount: Math.round(params.amountGhs * 100),
      currency: "GHS",
      reference: params.reference,
      mobile_money: { phone: params.phone, provider: params.provider },
    }),
  });

  const body = await response.json().catch(() => null);
  if (!body) return { status: false, message: "Paystack returned an invalid response." };
  return body as PaystackChargeResponse;
}

/** Continues a charge that came back with data.status === "send_otp" — must reuse that same charge's reference. */
export async function submitMobileMoneyOtp(params: {
  reference: string;
  otp: string;
}): Promise<PaystackChargeResponse> {
  const response = await fetch(`${BASE_URL}/charge/submit_otp`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ reference: params.reference, otp: params.otp }),
  });

  const body = await response.json().catch(() => null);
  if (!body) return { status: false, message: "Paystack returned an invalid response." };
  return body as PaystackChargeResponse;
}

/** Independent re-verification of a transaction's true status — never trust a webhook payload alone before crediting an order. */
export async function verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const response = await fetch(`${BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: headers(),
  });

  const body = await response.json().catch(() => null);
  if (!body) return { status: false, message: "Paystack returned an invalid response." };
  return body as PaystackVerifyResponse;
}
