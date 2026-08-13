import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Users, Wallet, Package } from "lucide-react";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StatTile } from "@/components/admin/reports/stat-tile";
import {
  getCustomerCount,
  getLowStockItems,
  getOrderStatusCounts,
  getProductCount,
  getRecentOrders,
  getRevenueStats,
} from "@/lib/admin/reports/queries";
import { formatCurrency } from "@/lib/currency/format";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const IN_FLIGHT_STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "ready_for_dispatch",
  "dispatched",
  "out_for_delivery",
];

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [revenue, statusCounts, productCount, customerCount, lowStockItems, recentOrders] =
    await Promise.all([
      getRevenueStats(supabase),
      getOrderStatusCounts(supabase),
      getProductCount(supabase),
      getCustomerCount(supabase),
      getLowStockItems(supabase),
      getRecentOrders(supabase, 8),
    ]);

  const pendingCount = IN_FLIGHT_STATUSES.reduce((sum, s) => sum + statusCounts[s], 0);

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Total Revenue" value={formatCurrency(revenue.total, "GHS")} icon={Wallet} />
        <StatTile
          label="This Month"
          value={formatCurrency(revenue.thisMonth, "GHS")}
          sublabel={`Today: ${formatCurrency(revenue.today, "GHS")}`}
          icon={Wallet}
        />
        <StatTile label="Pending Orders" value={String(pendingCount)} icon={Clock} />
        <StatTile label="Completed Orders" value={String(statusCounts.delivered)} icon={CheckCircle2} />
        <StatTile label="Products" value={String(productCount)} icon={Package} />
        <StatTile label="Customers" value={String(customerCount)} icon={Users} />
      </div>

      <div className="mt-4">
        <StatTile
          label="Low Stock Alerts"
          value={String(lowStockItems.length)}
          sublabel="Sizes at or below their alert threshold"
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl tracking-wide text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.orderNumber}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.customerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
