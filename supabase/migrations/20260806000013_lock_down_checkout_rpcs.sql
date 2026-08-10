-- Corrective fix: this Supabase project has default privileges that grant
-- EXECUTE on new functions directly to anon/authenticated (not just via
-- PUBLIC), confirmed via information_schema.routine_privileges. The prior
-- migration's `revoke ... from public` did NOT remove these direct grants.
-- These two RPCs must only be callable via the service-role client.
revoke execute on function public.increment_coupon_usage(uuid) from anon, authenticated;
revoke execute on function public.confirm_payment_success(uuid, text, jsonb) from anon, authenticated;
