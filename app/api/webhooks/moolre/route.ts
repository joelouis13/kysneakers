import { type NextRequest, NextResponse } from "next/server";

import { getOrderById } from "@/lib/checkout/queries";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";
import { checkPaymentStatus } from "@/lib/moolre/client";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Moolre's callback URL is registered account-wide, not per-transaction, so
 * this can't identify an order via query params — it must resolve the
 * payment from the payload itself. The payload's exact shape and any
 * signature scheme are undocumented, so it is NEVER trusted directly: this
 * handler always independently re-verifies via the status endpoint before
 * changing any state. Always responds 200 quickly, per Moolre's own guidance
 * ("record the event, return a quick success response") — never lets a
 * malformed/unmatched/ambiguous payload trigger their retry/backoff.
 */
export async function POST(request: NextRequest) {
  const supabase = createServiceRoleClient();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const data = (payload as { data?: unknown })?.data;
  const candidateRef =
    typeof data === "string"
      ? data
      : ((data as { transactionid?: string; id?: string } | undefined)?.transactionid ??
        (data as { transactionid?: string; id?: string } | undefined)?.id ??
        null);

  if (!candidateRef) {
    await supabase.from("audit_logs").insert({
      action: "moolre_webhook_unresolvable",
      table_name: "payments",
      new_value: payload as never,
    });
    return NextResponse.json({ ok: true });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("id,provider_reference")
    .eq("provider_reference", candidateRef)
    .maybeSingle();

  if (!payment || !payment.provider_reference) {
    await supabase.from("audit_logs").insert({
      action: "moolre_webhook_unmatched",
      table_name: "payments",
      new_value: payload as never,
    });
    return NextResponse.json({ ok: true });
  }

  // Never trust the webhook's claimed status — independently re-confirm via
  // the status endpoint, per Moolre's own recommendation for high-value
  // transactions. txstatus's full enum isn't documented; only a confirmed
  // `1` is treated as success. Anything else is logged for manual review,
  // not assumed to mean failure.
  const statusResponse = await checkPaymentStatus({ id: payment.provider_reference, idtype: 2 });

  if (statusResponse.data?.txstatus === 1) {
    const { data: confirmResult } = await supabase.rpc("confirm_payment_success", {
      p_payment_id: payment.id,
      p_provider_reference: payment.provider_reference,
      p_webhook_payload: payload as never,
    });

    if (confirmResult?.[0]?.newly_confirmed) {
      const order = await getOrderById(supabase, confirmResult[0].order_id);
      if (order) await sendOrderConfirmationEmail(order);
    }
  } else {
    await supabase
      .from("payments")
      .update({ webhook_payload: payload as never })
      .eq("id", payment.id)
      .neq("status", "successful");
    await supabase.from("audit_logs").insert({
      action: "moolre_webhook_unconfirmed",
      table_name: "payments",
      record_id: payment.id,
      new_value: { webhook: payload, statusCheck: statusResponse } as never,
    });
  }

  return NextResponse.json({ ok: true });
}
