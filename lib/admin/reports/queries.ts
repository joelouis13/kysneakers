import type { SupabaseClient } from "@supabase/supabase-js";

import type { Currency } from "@/lib/currency/config";
import { convertBetween, getExchangeRates } from "@/lib/currency/rates";
import type { Database, OrderStatus } from "@/types/database";

type Client = SupabaseClient<Database>;

export type RevenueStats = { total: number; today: number; thisMonth: number };

/**
 * Revenue = orders not pending payment, cancelled, or refunded — money
 * actually collected and kept. Orders can be in GHS, USD, EUR, or GBP
 * (Stripe international orders) — every amount is converted to GHS before
 * summing, since naively adding raw totals across currencies would produce
 * a meaningless number.
 */
export async function getRevenueStats(supabase: Client): Promise<RevenueStats> {
  const { data, error } = await supabase
    .from("orders")
    .select("total,currency,created_at")
    .not("status", "in", "(pending_payment,cancelled,refunded)");
  if (error) throw error;

  const rates = await getExchangeRates();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let total = 0;
  let today = 0;
  let thisMonth = 0;
  for (const row of data ?? []) {
    const amountGhs = convertBetween(row.total, row.currency as Currency, "GHS", rates);
    total += amountGhs;
    const createdAt = new Date(row.created_at);
    if (createdAt >= startOfMonth) thisMonth += amountGhs;
    if (createdAt >= startOfToday) today += amountGhs;
  }
  return { total, today, thisMonth };
}

const EMPTY_STATUS_COUNTS: Record<OrderStatus, number> = {
  pending_payment: 0,
  paid: 0,
  processing: 0,
  ready_for_dispatch: 0,
  dispatched: 0,
  out_for_delivery: 0,
  delivered: 0,
  cancelled: 0,
  refunded: 0,
};

export async function getOrderStatusCounts(supabase: Client): Promise<Record<OrderStatus, number>> {
  const { data, error } = await supabase.from("orders").select("status");
  if (error) throw error;

  const counts = { ...EMPTY_STATUS_COUNTS };
  for (const row of data ?? []) counts[row.status]++;
  return counts;
}

export async function getProductCount(supabase: Client): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .is("deleted_at", null);
  if (error) throw error;
  return count ?? 0;
}

export async function getCustomerCount(supabase: Client): Promise<number> {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role_id", 5);
  if (error) throw error;
  return count ?? 0;
}

export type LowStockItem = {
  productId: string;
  productName: string;
  productSlug: string;
  size: string;
  quantity: number;
  lowStockThreshold: number;
};

type LowStockRow = {
  quantity: number;
  low_stock_threshold: number;
  product_sizes: {
    size: string;
    products: { id: string; name: string; slug: string; status: string; deleted_at: string | null } | null;
  } | null;
};

export async function getLowStockItems(supabase: Client): Promise<LowStockItem[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select("quantity, low_stock_threshold, product_sizes ( size, products ( id, name, slug, status, deleted_at ) )");
  if (error) throw error;

  const rows = (data ?? []) as unknown as LowStockRow[];

  return rows
    .filter(
      (r) =>
        r.quantity <= r.low_stock_threshold &&
        r.product_sizes?.products &&
        r.product_sizes.products.status === "active" &&
        !r.product_sizes.products.deleted_at
    )
    .map((r) => ({
      productId: r.product_sizes!.products!.id,
      productName: r.product_sizes!.products!.name,
      productSlug: r.product_sizes!.products!.slug,
      size: r.product_sizes!.size,
      quantity: r.quantity,
      lowStockThreshold: r.low_stock_threshold,
    }));
}

export type RecentOrder = {
  orderNumber: string;
  customerName: string;
  total: number;
  currency: Currency;
  status: OrderStatus;
  createdAt: string;
};

export async function getRecentOrders(supabase: Client, limit = 8): Promise<RecentOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("order_number,customer_name,total,currency,status,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((r) => ({
    orderNumber: r.order_number,
    currency: r.currency as Currency,
    customerName: r.customer_name,
    total: r.total,
    status: r.status,
    createdAt: r.created_at,
  }));
}
