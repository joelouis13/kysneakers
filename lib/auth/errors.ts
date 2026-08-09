import { isAuthError } from "@supabase/supabase-js";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/** Maps Supabase's stable AuthError.code to user-facing copy. Never surfaces raw SDK/Postgres messages. */
const MESSAGES_BY_CODE: Record<string, string> = {
  // Deliberately identical to a generic message — never confirm/deny which
  // half of email+password was wrong (prevents user enumeration).
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed: "Please confirm your email address before signing in.",
  user_already_exists: "An account with this email already exists.",
  email_exists: "An account with this email already exists.",
  identity_already_exists: "An account with this email already exists.",
  weak_password: "Password is too weak. Try a longer, less common password.",
  same_password: "New password must be different from your current password.",
  over_email_send_rate_limit: "Too many requests. Please wait a moment and try again.",
  over_request_rate_limit: "Too many requests. Please wait a moment and try again.",
  signup_disabled: "New sign-ups are currently disabled.",
  user_banned: "This account has been suspended.",
  email_address_invalid: "Enter a valid email address.",
  otp_expired: "This link has expired. Please request a new one.",
  bad_code_verifier: "This link is invalid or has expired.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.code && MESSAGES_BY_CODE[error.code]) {
    return MESSAGES_BY_CODE[error.code];
  }
  return FALLBACK_MESSAGE;
}
