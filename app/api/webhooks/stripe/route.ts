import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { getOrderById } from "@/lib/checkout/queries";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";
import { getStripeWebhookSecret } from "@/lib/stripe/config";
import { getStripeClient } from "@/lib/stripe/client";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Unlike Moolre's webhook (undocumented payload, no signature — must
 * re-verify via a status-check round trip), Stripe webhooks ARE
 * cryptographically signed. Signature verification via
 * stripe.webhooks.constructEvent IS the trust boundary here — no second
 * round-trip needed. Always responds 200 quickly on any handled/unhandled
 * path, mirroring the Moolre webhook's "log and move on" convention so a
 * malformed or unexpected event never triggers pointless retries.
 */
export async function POST(request: NextRequest) {
  const supabase = createServiceRoleClient();

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const webhookSecret = getStripeWebhookSecret();
    if (!signature) throw new Error("Missing stripe-signature header.");
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    await supabase.from("audit_logs").insert({
      action: "stripe_webhook_unverified",
      table_name: "payments",
      new_value: { error: err instanceof Error ? err.message : String(err) } as never,
    });
    return NextResponse.json({ ok: true });
  }

  if (event.type !== "checkout.session.completed") {
    await supabase.from("audit_logs").insert({
      action: "stripe_webhook_unhandled_event",
      table_name: "payments",
      new_value: { type: event.type } as never,
    });
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const paymentId = session.metadata?.payment_id;

  if (!paymentId) {
    await supabase.from("audit_logs").insert({
      action: "stripe_webhook_unresolvable",
      table_name: "payments",
      new_value: event as never,
    });
    return NextResponse.json({ ok: true });
  }

  if (session.payment_status === "paid") {
    const { data: confirmResult } = await supabase.rpc("confirm_payment_success", {
      p_payment_id: paymentId,
      p_provider_reference: session.id,
      p_webhook_payload: event as never,
    });

    if (confirmResult?.[0]?.newly_confirmed) {
      const order = await getOrderById(supabase, confirmResult[0].order_id);
      if (order) await sendOrderConfirmationEmail(order);
    }
  } else {
    await supabase
      .from("payments")
      .update({ webhook_payload: event as never })
      .eq("id", paymentId)
      .neq("status", "successful");
    await supabase.from("audit_logs").insert({
      action: "stripe_webhook_unconfirmed",
      table_name: "payments",
      record_id: paymentId,
      new_value: event as never,
    });
  }

  return NextResponse.json({ ok: true });
}
