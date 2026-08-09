import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles email-link auth flows (signup confirmation, password recovery) —
 * Supabase's recovery/confirmation emails point here with a token_hash/type
 * pair. OAuth (Google) uses a separate `code` param handled by
 * app/auth/callback/route.ts instead.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      redirect(next);
    }
  }

  redirect("/auth/auth-code-error");
}
