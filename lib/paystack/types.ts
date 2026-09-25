/** Ghana Mobile Money provider codes Paystack's Charge API expects. */
export type PaystackMobileMoneyProvider = "mtn" | "vod" | "atl";

/**
 * `pay_offline` = fully phone-native (customer approves via push + PIN on
 * their device, nothing more to do here) — the common case for Ghana MoMo.
 * `send_otp` = Paystack still needs an OTP submitted back through the API
 * for this specific account/number (confirmed via real-world reports this
 * does happen for some Ghana MoMo numbers despite the docs' phone-native
 * framing) — same in-app OTP step the Moolre integration already has.
 */
export type PaystackChargeStatus =
  | "pay_offline"
  | "send_otp"
  | "send_pin"
  | "pending"
  | "success"
  | "failed"
  | "abandoned";

export type PaystackChargeData = {
  status: PaystackChargeStatus;
  reference: string;
  display_text?: string;
  gateway_response?: string;
};

/** `status` here is the API call's own success/failure, separate from `data.status` (the charge's state). */
export type PaystackChargeResponse = {
  status: boolean;
  message: string;
  data?: PaystackChargeData;
};

export type PaystackVerifyData = {
  status: "success" | "failed" | "abandoned" | "pending" | string;
  reference: string;
  amount: number;
  currency: string;
  gateway_response?: string;
};

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: PaystackVerifyData;
};
