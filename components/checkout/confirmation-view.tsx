"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";

import { OrderStatusView } from "@/components/orders/order-status-view";
import { useOrderStatus } from "@/lib/checkout/hooks";
import { getStashedContact } from "@/lib/checkout/session-contact";

// sessionStorage is only set once, right before navigating here, so a
// static snapshot (no live subscription) is enough — this just needs to
// defer the read to the client, which useSyncExternalStore does cleanly
// (getServerSnapshot below returns null during SSR, matching reality).
function subscribeNoop() {
  return () => {};
}
function getServerSnapshot() {
  return null;
}

export function ConfirmationView({ orderNumber }: { orderNumber: string }) {
  const getSnapshot = useCallback(() => getStashedContact(orderNumber), [orderNumber]);
  const contact = useSyncExternalStore(subscribeNoop, getSnapshot, getServerSnapshot);

  const { data, isLoading } = useOrderStatus(orderNumber, contact ?? "");

  if (contact && isLoading) {
    return <p className="text-sm text-muted-foreground">Loading your order...</p>;
  }

  if (!contact || !data || "error" in data) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <h1 className="font-heading text-2xl tracking-wide text-foreground">
          Order {orderNumber} placed
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          For your security, we can only show order details right after checkout in this
          browser session. To check the status later, use Track Order with your email or
          phone number.
        </p>
        <Link
          href="/track-order"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Track Order
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 font-heading text-3xl tracking-wide text-foreground">
        Thank you for your order
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        A confirmation has been sent for order {orderNumber}.
      </p>
      <OrderStatusView initialOrder={data.order} />
    </>
  );
}
