import type { Metadata } from "next";

import { OrderFilters } from "@/components/admin/orders/order-filters";
import { OrderList } from "@/components/admin/orders/order-list";
import { listAdminOrders, type AdminOrderFilters } from "@/lib/admin/orders/queries";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Orders",
};

type RawSearchParams = { [key: string]: string | string[] | undefined };

const STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "ready_for_dispatch",
  "dispatched",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const status =
    typeof sp.status === "string" && STATUSES.includes(sp.status as OrderStatus)
      ? (sp.status as OrderStatus)
      : undefined;

  const filters: AdminOrderFilters = {
    status,
    q: typeof sp.q === "string" ? sp.q : undefined,
  };

  const orders = await listAdminOrders(supabase, filters);

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Orders</h1>
      <OrderFilters />
      <OrderList orders={orders} />
    </div>
  );
}
