import crypto from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import { getOrderById } from "@/lib/checkout/queries";
import { sendNewOrderStaffNotification, sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";
import { verifyTransaction } from "@/lib/paystack/client";
import { getPaystackSecretKey } from "@/lib/paystack/config";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Paystack signs webhooks (x-paystack-signature = HMAC-SHA512 of the raw
 * body using the secret key) — unlike Moolre's undocumented payload, so
 * signature verification IS a real trust boundary here. Still independently
 * re-verifies via the transaction/verify endpoint before crediting anything,
 * same caution as Moolre's webhook, since real money is on the line and a
 * webhook payload is still just a claim until Paystack's own API confirms it.
 * Always responds 200 quickly on any handled/unhandled/invalid path so a
 * malformed or unexpected event never triggers pointless retries.
 */
export async function POST(request: NextRequest) {
  const supabase = createServiceRoleClient();

  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  let verified = false;
  try {
    const expected = crypto.createHmac("sha512", getPaystackSecretKey()).update(rawBody).digest("hex");
    verified =
      !!signature &&
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    verified = false;
  }

  if (!verified) {
    await supabase.from("audit_logs").insert({
      action: "paystack_webhook_unverified",
      table_name: "payments",
      new_value: { signaturePresent: !!signature } as never,
    });
    return NextResponse.json({ ok: true });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (event.event !== "charge.success") {
    await supabase.from("audit_logs").insert({
      action: "paystack_webhook_unhandled_event",
      table_name: "payments",
      new_value: { type: event.event } as never,
    });
    return NextResponse.json({ ok: true });
  }

  const reference = event.data?.reference;
  if (!reference) {
    await supabase.from("audit_logs").insert({
      action: "paystack_webhook_unresolvable",
      table_name: "payments",
      new_value: event as never,
    });
    return NextResponse.json({ ok: true });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("id,provider_reference")
    .eq("provider_reference", reference)
    .maybeSingle();

  if (!payment) {
    await supabase.from("audit_logs").insert({
      action: "paystack_webhook_unmatched",
      table_name: "payments",
      new_value: event as never,
    });
    return NextResponse.json({ ok: true });
  }

  const verifyResponse = await verifyTransaction(reference);

  if (verifyResponse.status && verifyResponse.data?.status === "success") {
    const { data: confirmResult } = await supabase.rpc("confirm_payment_success", {
      p_payment_id: payment.id,
      p_provider_reference: reference,
      p_webhook_payload: event as never,
    });

    if (confirmResult?.[0]?.newly_confirmed) {
      const order = await getOrderById(supabase, confirmResult[0].order_id);
      if (order) {
        await sendOrderConfirmationEmail(order);
        await sendNewOrderStaffNotification(order);
      }
    }
  } else {
    await supabase
      .from("payments")
      .update({ webhook_payload: event as never })
      .eq("id", payment.id)
      .neq("status", "successful");
    await supabase.from("audit_logs").insert({
      action: "paystack_webhook_unconfirmed",
      table_name: "payments",
      record_id: payment.id,
      new_value: { webhook: event, verify: verifyResponse } as never,
    });
  }

  return NextResponse.json({ ok: true });
}
