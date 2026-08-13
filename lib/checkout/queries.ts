import type { SupabaseClient } from "@supabase/supabase-js";

import type { Currency } from "@/lib/currency/config";
import type { Database, PaymentMethod, PaymentStatus } from "@/types/database";

import type { CouponPreview, OrderStatusPayload } from "./types";

type Client = SupabaseClient<Database>;

export async function getAddresses(supabase: Client) {
  const { data, error } = await supabase
    .from("addresses")
    .select("id,label,recipient_name,phone,region,city,street_address,landmark,is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Preview-only — mirrors the exact rounding logic the old placeholder used. Not the authoritative gate; increment_coupon_usage is. */
export async function getCouponPreview(
  supabase: Client,
  code: string,
  subtotal: number
): Promise<CouponPreview> {
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("code,discount_type,discount_value,minimum_purchase,usage_limit,times_used,starts_at,expires_at")
    .ilike("code", code.trim())
    .maybeSingle();
  if (error) throw error;

  // coupons_select_active RLS already filters to is_active/non-deleted rows,
  // so no row here covers not-found, inactive, and deleted uniformly.
  if (!coupon) {
    return { valid: false, reason: "not_found", message: "Invalid or expired coupon code." };
  }

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, reason: "not_started", message: "This coupon isn't active yet." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, reason: "expired", message: "This coupon has expired." };
  }
  if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, reason: "usage_limit_reached", message: "This coupon has reached its usage limit." };
  }
  if (subtotal < coupon.minimum_purchase) {
    return {
      valid: false,
      reason: "below_minimum",
      message: `Add ${(coupon.minimum_purchase - subtotal).toFixed(0)} more to use this coupon.`,
    };
  }

  const discount =
    coupon.discount_type === "percentage"
      ? Math.round(subtotal * (coupon.discount_value / 100))
      : Math.min(coupon.discount_value, subtotal);

  const description =
    coupon.discount_type === "percentage"
      ? `${coupon.discount_value}% off${coupon.minimum_purchase > 0 ? ` orders over GHS ${coupon.minimum_purchase}` : ""}`
      : `GHS ${coupon.discount_value} off${coupon.minimum_purchase > 0 ? ` orders over GHS ${coupon.minimum_purchase}` : ""}`;

  return { valid: true, code: coupon.code, discount, description };
}

const ORDER_STATUS_SELECT = `
  id, order_number, status, customer_email, customer_phone,
  subtotal, discount_total, delivery_fee, total, currency, created_at,
  order_items ( product_name, size, sku, unit_price, quantity, line_total ),
  payments ( id, status, method, provider_message )
`;

type OrderStatusRow = {
  id: string;
  order_number: string;
  status: OrderStatusPayload["status"];
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount_total: number;
  delivery_fee: number;
  total: number;
  currency: string;
  created_at: string;
  order_items: {
    product_name: string;
    size: string;
    sku: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[];
  payments: {
    id: string;
    status: PaymentStatus;
    method: PaymentMethod;
    provider_message: string | null;
  }[];
};

export function mapOrderStatusRow(row: OrderStatusRow): OrderStatusPayload {
  return {
    orderId: row.id,
    orderNumber: row.order_number,
    status: row.status,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    subtotal: row.subtotal,
    discountTotal: row.discount_total,
    deliveryFee: row.delivery_fee,
    total: row.total,
    currency: row.currency as Currency,
    createdAt: row.created_at,
    items: row.order_items.map((i) => ({
      productName: i.product_name,
      size: i.size,
      sku: i.sku,
      unitPrice: i.unit_price,
      quantity: i.quantity,
      lineTotal: i.line_total,
    })),
    payment: row.payments[0]
      ? {
          id: row.payments[0].id,
          status: row.payments[0].status,
          method: row.payments[0].method,
          providerMessage: row.payments[0].provider_message,
        }
      : null,
  };
}

/** RLS-based (orders_select_own) — logged-in user's own orders only. */
export async function getOwnOrders(supabase: Client) {
  const { data, error } = await supabase
    .from("orders")
    .select("id,order_number,status,total,currency,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Fetches by order_number using whatever client is passed — RLS-scoped to
 * "own orders" when called with the cookie-based client, unscoped when
 * called with the service-role client (callers doing the latter, e.g.
 * lookupOrderStatus, are responsible for their own authorization check).
 */
export async function getOrderByNumber(
  supabase: Client,
  orderNumber: string
): Promise<OrderStatusPayload | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_STATUS_SELECT)
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapOrderStatusRow(data as unknown as OrderStatusRow);
}

export async function getOrderById(
  supabase: Client,
  orderId: string
): Promise<OrderStatusPayload | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_STATUS_SELECT)
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapOrderStatusRow(data as unknown as OrderStatusRow);
}
