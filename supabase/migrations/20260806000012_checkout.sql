-- Shipping snapshot columns on orders. Mirrors why customer_name/email/phone
-- and order_items already snapshot details: guests have no addresses row to
-- reference, and even a logged-in user's saved address can be edited/deleted
-- later, so the snapshot (not shipping_address_id) is authoritative for
-- display/fulfillment. Safe as NOT NULL directly -- orders has zero rows.
alter table public.orders
  add column shipping_recipient_name text not null,
  add column shipping_phone text not null,
  add column shipping_region text not null,
  add column shipping_city text not null,
  add column shipping_street_address text not null,
  add column shipping_landmark text;

-- payer_phone: the MoMo number actually charged (can differ from
-- customer_phone, re-enterable on retry). provider_message: Moolre's last
-- response code/message (e.g. "TP14"/"TR099") -- kept separate from
-- provider_reference, which must stay strictly the Moolre transaction id.
alter table public.payments
  add column payer_phone text not null,
  add column provider_message text;

-- increment_coupon_usage: the actual gate for whether a discount is honored.
-- Atomically re-validates the coupon is still usable AND increments
-- times_used in one statement, closing the race between a client-side
-- preview and final order creation. Internal-only -- see revoke/grant below.
create or replace function public.increment_coupon_usage(p_coupon_id uuid)
returns public.coupons
language sql
as $$
  update public.coupons
  set times_used = times_used + 1
  where id = p_coupon_id
    and is_active = true
    and deleted_at is null
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at >= now())
    and (usage_limit is null or times_used < usage_limit)
  returning *;
$$;

-- This project grants EXECUTE on new functions to anon/authenticated via
-- default privileges (confirmed empirically, not just PUBLIC-inherited) --
-- revoke from all three explicitly, not just PUBLIC.
revoke execute on function public.increment_coupon_usage(uuid) from public, anon, authenticated;
grant execute on function public.increment_coupon_usage(uuid) to service_role;

-- confirm_payment_success: idempotent (Moolre callback delivery is
-- at-least-once) -- locks the payment row, no-ops if already successful,
-- otherwise marks payment+order paid, decrements inventory (floor-clamped
-- defensively -- stock was already checked at order time), logs a
-- notification. Internal-only, called via the service-role client after an
-- independent status-endpoint re-verification, never trusting a webhook
-- payload directly.
create or replace function public.confirm_payment_success(
  p_payment_id uuid,
  p_provider_reference text,
  p_webhook_payload jsonb
)
returns table (order_id uuid, order_status text, payment_status text)
language plpgsql
as $$
declare
  v_payment public.payments;
  v_order_id uuid;
begin
  select * into v_payment from public.payments where id = p_payment_id for update;

  if v_payment.id is null then
    return;
  end if;

  if v_payment.status = 'successful' then
    return query select v_payment.order_id, o.status, v_payment.status
      from public.orders o where o.id = v_payment.order_id;
    return;
  end if;

  update public.payments
  set status = 'successful',
      verified_at = now(),
      provider_reference = p_provider_reference,
      webhook_payload = p_webhook_payload
  where id = p_payment_id;

  update public.orders
  set status = 'paid'
  where id = v_payment.order_id and status = 'pending_payment';

  v_order_id := v_payment.order_id;

  update public.inventory inv
  set quantity = greatest(0, inv.quantity - oi.quantity)
  from public.order_items oi
  where oi.order_id = v_order_id
    and oi.product_size_id = inv.product_size_id;

  insert into public.notifications (profile_id, channel, type, title, body)
  select o.profile_id, 'in_app', 'order_confirmed',
         'Order confirmed', 'Your order ' || o.order_number || ' has been paid and is being processed.'
  from public.orders o where o.id = v_order_id;

  return query select o.id, o.status, p.status
    from public.orders o join public.payments p on p.id = p_payment_id
    where o.id = v_order_id;
end;
$$;

revoke execute on function public.confirm_payment_success(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.confirm_payment_success(uuid, text, jsonb) to service_role;

-- Real coupons to replace the placeholder demoCoupons now that checkout is
-- real. Coupon writes are staff-only with no admin UI yet, so seeding is the
-- only way to get testable rows.
insert into public.coupons (code, discount_type, discount_value, minimum_purchase, usage_limit) values
  ('WELCOME10', 'percentage', 10, 0, null),
  ('SAVE50', 'fixed_amount', 50, 300, null),
  ('KYS20', 'percentage', 20, 500, 100)
on conflict (code) do nothing;
