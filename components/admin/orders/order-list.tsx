import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import type { AdminOrderListItem } from "@/lib/admin/orders/types";
import { formatCurrency } from "@/lib/currency/format";

export function OrderList({ orders }: { orders: AdminOrderListItem[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No orders found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/admin/orders/${order.id}`}
          className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 hover:border-primary"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
            <p className="truncate text-xs text-muted-foreground">
              {order.customerName} · {order.customerEmail}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("en-GH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-sm font-medium text-foreground">
              {formatCurrency(order.total, order.currency)}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
