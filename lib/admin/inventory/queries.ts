import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { AdminInventoryRow } from "./types";

type Client = SupabaseClient<Database>;

export type AdminInventoryFilters = {
  q?: string;
  lowStockOnly?: boolean;
};

type Row = {
  id: string;
  quantity: number;
  low_stock_threshold: number;
  product_sizes: {
    size: string;
    products: { id: string; name: string; slug: string; status: string; deleted_at: string | null } | null;
  } | null;
};

export async function listAdminInventory(
  supabase: Client,
  filters: AdminInventoryFilters
): Promise<AdminInventoryRow[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select("id, quantity, low_stock_threshold, product_sizes ( size, products ( id, name, slug, status, deleted_at ) )");
  if (error) throw error;

  const rows = (data ?? []) as unknown as Row[];
  const term = filters.q?.trim().toLowerCase();

  return rows
    .filter((r) => r.product_sizes?.products && !r.product_sizes.products.deleted_at)
    .map((r) => {
      const product = r.product_sizes!.products!;
      return {
        inventoryId: r.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        size: r.product_sizes!.size,
        quantity: r.quantity,
        lowStockThreshold: r.low_stock_threshold,
        isLowStock: r.quantity <= r.low_stock_threshold,
      };
    })
    .filter((row) => !term || row.productName.toLowerCase().includes(term))
    .filter((row) => !filters.lowStockOnly || row.isLowStock)
    .sort((a, b) => a.productName.localeCompare(b.productName) || a.size.localeCompare(b.size));
}
