import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/** OAuth (Google) code-exchange step — redirected here after the user approves on Google's side. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
  }

  redirect("/auth/auth-code-error");
}
