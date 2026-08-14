import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // proxy.ts already refreshes the session on every request. A second,
        // uncoordinated background timer here can rewrite the chunked
        // session cookie at the same instant a Server Action reads it,
        // intermittently making a fresh session look logged-out.
        autoRefreshToken: false,
      },
    }
  );
}
