"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SIGNUPS_ENABLED } from "./config";
import { getAuthErrorMessage } from "./errors";
import { getSafeRedirectPath } from "./redirect";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  type ForgotPasswordValues,
  type LoginValues,
  type ResetPasswordValues,
  type SignupValues,
} from "./schemas";

function siteUrl(): string {
  return process.env.SITE_URL ?? "http://localhost:3000";
}

export async function login(
  values: LoginValues,
  redirectTo?: string
): Promise<{ error: string } | void> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: getAuthErrorMessage(error) };

  const safePath = getSafeRedirectPath(redirectTo);

  // No specific page prompted this login (the common default) — send staff
  // straight to the admin dashboard instead of the storefront home page.
  // A specific redirect target (e.g. bounced from /admin, or from checkout)
  // is always respected as-is.
  if (safePath === "/") {
    const { data: isStaff } = await supabase.rpc("is_staff");
    if (isStaff) redirect("/admin");
  }

  redirect(safePath);
}

export async function signup(
  values: SignupValues,
  redirectTo?: string
): Promise<{ error: string } | { needsEmailConfirmation: true } | void> {
  if (!SIGNUPS_ENABLED) return { error: "New account sign-ups are currently closed." };

  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input." };

  const supabase = await createClient();
  const safePath = getSafeRedirectPath(redirectTo);
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(safePath)}`,
    },
  });
  if (error) return { error: getAuthErrorMessage(error) };

  if (data.session) {
    redirect(safePath);
  }
  return { needsEmailConfirmation: true };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  values: ForgotPasswordValues
): Promise<{ error: string } | { success: true }> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/reset-password`,
  });

  // Never confirm/deny whether the email exists — only surface genuine
  // failures like rate limiting.
  if (error && error.code === "over_email_send_rate_limit") {
    return { error: getAuthErrorMessage(error) };
  }
  return { success: true };
}

export async function updatePassword(
  values: ResetPasswordValues
): Promise<{ error: string } | void> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: getAuthErrorMessage(error) };

  redirect("/login?reset=success");
}
