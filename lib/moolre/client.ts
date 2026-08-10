import { getMoolreBaseUrl, getMoolreCredentials } from "./config";
import type {
  InitiatePaymentResponse,
  MoolreChannel,
  PaymentStatusResponse,
} from "./types";
import type { PaymentMethod } from "@/types/database";

export function channelForMethod(method: PaymentMethod): MoolreChannel {
  switch (method) {
    case "mtn_momo":
      return "13";
    case "telecel_cash":
      return "6";
    case "airteltigo_money":
      return "7";
  }
}

function headers(): HeadersInit {
  const { apiUser, apiKey } = getMoolreCredentials();
  return {
    "Content-Type": "application/json",
    "X-API-USER": apiUser,
    "X-API-PUBKEY": apiKey,
  };
}

/** Throws on genuine network/config failure; Moolre-level error codes come back as a typed response, not a throw. */
export async function initiatePayment(params: {
  payer: string;
  amount: string;
  externalref: string;
  channel: MoolreChannel;
  otpcode?: string;
}): Promise<InitiatePaymentResponse> {
  const { accountNumber } = getMoolreCredentials();

  const response = await fetch(`${getMoolreBaseUrl()}/open/transact/payment`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      type: 1,
      channel: params.channel,
      currency: "GHS",
      payer: params.payer,
      amount: params.amount,
      externalref: params.externalref,
      accountnumber: accountNumber,
      ...(params.otpcode ? { otpcode: params.otpcode } : {}),
    }),
  });

  const body = await response.json().catch(() => null);
  if (!body) {
    return { status: 0, code: "NETWORK_ERROR", message: "Moolre returned an invalid response." };
  }
  return body as InitiatePaymentResponse;
}

export async function checkPaymentStatus(params: {
  id: string;
  idtype: 1 | 2;
}): Promise<PaymentStatusResponse> {
  const { accountNumber } = getMoolreCredentials();

  const response = await fetch(`${getMoolreBaseUrl()}/open/transact/status`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      type: 1,
      idtype: params.idtype,
      id: params.id,
      accountnumber: accountNumber,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!body) {
    return { status: 0, code: "NETWORK_ERROR", message: "Moolre returned an invalid response.", data: null };
  }
  return body as PaymentStatusResponse;
}
