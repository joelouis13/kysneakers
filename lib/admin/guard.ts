import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { createServiceRoleClient } from "@/lib/supabase/server";

/** Defense-in-depth re-check for admin Server Actions — the page layer (app/admin/layout.tsx) already blocks access, but actions can theoretically be invoked directly. */
export async function requireStaffUser(
  supabase: SupabaseClient<Database>
): Promise<{ userId: string } | { error: string }> {
  let {
    data: { user },
  } = await supabase.auth.getUser();

  // A valid session can transiently look empty right after the browser's
  // chunked auth cookie was mid-rewrite when this request landed. One retry
  // (which forces a fresh read/refresh) is enough to self-heal that race.
  if (!user) {
    await supabase.auth.refreshSession();
    ({
      data: { user },
    } = await supabase.auth.getUser());
  }
  if (!user) return { error: "You must be logged in." };

  const { data: isStaff } = await supabase.rpc("is_staff");
  if (!isStaff) return { error: "You don't have permission to do that." };

  return { userId: user.id };
}

/** Shared audit-log insert for every admin mutation — uses the service-role client since audit_logs has no client-side insert policy (staff can only select). */
export async function logAudit(
  tableName: string,
  action: string,
  recordId: string,
  profileId: string,
  newValue: unknown
): Promise<void> {
  const serviceClient = createServiceRoleClient();
  await serviceClient.from("audit_logs").insert({
    action,
    table_name: tableName,
    record_id: recordId,
    profile_id: profileId,
    new_value: newValue as never,
  });
}
