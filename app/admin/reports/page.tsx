import type { Metadata } from "next";
import { AlertTriangle, Wallet } from "lucide-react";

import { StatTile } from "@/components/admin/reports/stat-tile";
import { Badge } from "@/components/ui/badge";
import {
  getLowStockItems,
  getOrderStatusCounts,
  getRevenueStats,
} from "@/lib/admin/reports/queries";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Reports",
};

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  ready_for_dispatch: "Ready for Dispatch",
  dispatched: "Dispatched",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const [revenue, statusCounts, lowStockItems] = await Promise.all([
    getRevenueStats(supabase),
    getOrderStatusCounts(supabase),
    getLowStockItems(supabase),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Reports</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Today's Revenue" value={currency.format(revenue.today)} icon={Wallet} />
        <StatTile label="This Month's Revenue" value={currency.format(revenue.thisMonth)} icon={Wallet} />
        <StatTile label="All-Time Revenue" value={currency.format(revenue.total)} icon={Wallet} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">Orders by Status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
            <div key={status} className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">{STATUS_LABELS[status]}</p>
              <p className="mt-1 font-heading text-2xl tracking-wide text-foreground">
                {statusCounts[status]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          <h2 className="font-heading text-xl tracking-wide text-foreground">Low Stock</h2>
        </div>

        {lowStockItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing is low on stock right now.</p>
        ) : (
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">Size {item.size}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Alert at {item.lowStockThreshold}
                  </span>
                  <Badge variant="destructive">{item.quantity} left</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
