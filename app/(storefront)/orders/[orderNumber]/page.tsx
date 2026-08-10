import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { OrderStatusView } from "@/components/orders/order-status-view";
import { getOrderByNumber } from "@/lib/checkout/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/orders/${orderNumber}`);

  // RLS (orders_select_own) scopes this to the current user's own orders —
  // a mismatch or someone else's order both come back as null here.
  const order = await getOrderByNumber(supabase, orderNumber);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-heading text-3xl tracking-wide text-foreground">
        Order {order.orderNumber}
      </h1>
      <OrderStatusView initialOrder={order} />
    </div>
  );
}
