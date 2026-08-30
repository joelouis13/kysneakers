-- confirm_payment_success previously returned the same row shape whether
-- this call was the one that actually flipped payment/order to paid, or a
-- duplicate webhook delivery hitting the already-successful no-op path.
-- Callers (webhook routes) need to tell those apart to send the order
-- confirmation email exactly once, computed inside the same row-locked
-- transaction so concurrent at-least-once deliveries can't both see "not yet
-- confirmed" and both send. Table-returning function output columns can't be
-- changed via create or replace — must drop with the exact original
-- signature first.
drop function if exists public.confirm_payment_success(uuid, text, jsonb);

create function public.confirm_payment_success(
  p_payment_id uuid,
  p_provider_reference text,
  p_webhook_payload jsonb
)
returns table (order_id uuid, order_status text, payment_status text, newly_confirmed boolean)
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
    return query select v_payment.order_id, o.status, v_payment.status, false
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

  return query select o.id, o.status, p.status, true
    from public.orders o join public.payments p on p.id = p_payment_id
    where o.id = v_order_id;
end;
$$;

revoke execute on function public.confirm_payment_success(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.confirm_payment_success(uuid, text, jsonb) to service_role;
