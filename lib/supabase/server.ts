import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

/**
 * Server Components/Actions client. `setAll` can throw when called from a
 * Server Component render (cookies are read-only there) — safe to ignore
 * because `proxy.ts` refreshes the session on every request instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored — called from a Server Component.
          }
        },
      },
    }
  );
}

/**
 * Service-role client for trusted server-only operations (webhooks, admin
 * mutations, audit logging). Never import this into client-facing code.
 */
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op — service role client never reads/writes auth cookies.
        },
      },
    }
  );
}
