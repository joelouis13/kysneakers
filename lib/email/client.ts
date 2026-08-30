import { Resend } from "resend";

import { getResendApiKey } from "./config";

let cachedClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!cachedClient) {
    cachedClient = new Resend(getResendApiKey());
  }
  return cachedClient;
}
