import type { SupabaseClient } from "@supabase/supabase-js";

import type { Currency } from "@/lib/currency/config";
import type { Database, OrderStatus } from "@/types/database";

import type { AdminOrderDetail, AdminOrderListItem } from "./types";

type Client = SupabaseClient<Database>;

export type AdminOrderFilters = {
  status?: OrderStatus;
  q?: string;
};

const LIST_SELECT = "id,order_number,customer_name,customer_email,status,total,currency,created_at";

type ListRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  total: number;
  currency: Currency;
  created_at: string;
};

export async function listAdminOrders(
  supabase: Client,
  filters: AdminOrderFilters
): Promise<AdminOrderListItem[]> {
  let query = supabase.from("orders").select(LIST_SELECT);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.q) {
    const term = filters.q.replace(/[%,]/g, "");
    query = query.or(
      `order_number.ilike.%${term}%,customer_email.ilike.%${term}%,customer_name.ilike.%${term}%`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  return (data as unknown as ListRow[]).map((r) => ({
    id: r.id,
    orderNumber: r.order_number,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    status: r.status,
    total: r.total,
    currency: r.currency,
    createdAt: r.created_at,
  }));
}

const DETAIL_SELECT = `
  id, order_number, status, profile_id, customer_name, customer_email, customer_phone,
  shipping_recipient_name, shipping_phone, shipping_region, shipping_city, shipping_street_address, shipping_landmark,
  shipping_country, shipping_postal_code,
  subtotal, discount_total, delivery_fee, total, currency, vat_rate, vat_amount, notes, created_at,
  items:order_items ( product_name, size, sku, unit_price, quantity, line_total ),
  payments ( id, status, method, payer_phone, provider_reference, provider_message, verified_at, created_at )
`;

type DetailRow = {
  id: string;
  order_number: string;
  status: OrderStatus;
  profile_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_recipient_name: string;
  shipping_phone: string;
  shipping_region: string | null;
  shipping_city: string;
  shipping_street_address: string;
  shipping_landmark: string | null;
  shipping_country: string | null;
  shipping_postal_code: string | null;
  subtotal: number;
  discount_total: number;
  delivery_fee: number;
  total: number;
  currency: Currency;
  vat_rate: number;
  vat_amount: number;
  notes: string | null;
  created_at: string;
  items: AdminOrderDetail["items"];
  payments: {
    id: string;
    status: AdminOrderDetail["payments"][number]["status"];
    method: AdminOrderDetail["payments"][number]["method"];
    payer_phone: string | null;
    provider_reference: string | null;
    provider_message: string | null;
    verified_at: string | null;
    created_at: string;
  }[];
};

export async function getAdminOrderById(supabase: Client, id: string): Promise<AdminOrderDetail | null> {
  const { data, error } = await supabase.from("orders").select(DETAIL_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as DetailRow;
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    profileId: row.profile_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingRecipientName: row.shipping_recipient_name,
    shippingPhone: row.shipping_phone,
    shippingRegion: row.shipping_region,
    shippingCity: row.shipping_city,
    shippingStreetAddress: row.shipping_street_address,
    shippingLandmark: row.shipping_landmark,
    shippingCountry: row.shipping_country,
    shippingPostalCode: row.shipping_postal_code,
    subtotal: row.subtotal,
    discountTotal: row.discount_total,
    deliveryFee: row.delivery_fee,
    total: row.total,
    currency: row.currency,
    vatRate: row.vat_rate,
    vatAmount: row.vat_amount,
    notes: row.notes,
    createdAt: row.created_at,
    items: row.items,
    payments: row.payments.map((p) => ({
      id: p.id,
      status: p.status,
      method: p.method,
      payerPhone: p.payer_phone,
      providerReference: p.provider_reference,
      providerMessage: p.provider_message,
      verifiedAt: p.verified_at,
      createdAt: p.created_at,
    })),
  };
}
