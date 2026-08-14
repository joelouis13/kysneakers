import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, ProductStatus } from "@/types/database";

import type { AdminProductDetail, AdminProductListItem } from "./types";

type Client = SupabaseClient<Database>;

export type AdminProductFilters = {
  q?: string;
  status?: ProductStatus;
  brandId?: string;
  categoryId?: string;
  isFeatured?: boolean;
  view?: "active" | "deleted";
};

const LIST_SELECT = `
  id, sku, name, slug, status, regular_price, sale_price, eur_regular_price, eur_sale_price,
  is_featured, is_new_arrival, is_on_sale, deleted_at, created_at,
  brand:brands ( name ),
  category:categories ( name ),
  images:product_images ( url, is_featured, display_order ),
  sizes:product_sizes ( inventory ( quantity ) )
`;

type ListRow = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  status: ProductStatus;
  regular_price: number;
  sale_price: number | null;
  eur_regular_price: number | null;
  eur_sale_price: number | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  deleted_at: string | null;
  created_at: string;
  brand: { name: string } | null;
  category: { name: string } | null;
  images: { url: string; is_featured: boolean; display_order: number }[];
  sizes: { inventory: { quantity: number } | null }[];
};

function mapListRow(row: ListRow): AdminProductListItem {
  const images = [...row.images].sort((a, b) => a.display_order - b.display_order);
  const primary = images.find((i) => i.is_featured) ?? images[0];
  const totalStock = row.sizes.reduce((sum, s) => sum + (s.inventory?.quantity ?? 0), 0);

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    status: row.status,
    regularPrice: row.regular_price,
    salePrice: row.sale_price,
    eurRegularPrice: row.eur_regular_price,
    eurSalePrice: row.eur_sale_price,
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
    isOnSale: row.is_on_sale,
    brandName: row.brand?.name ?? null,
    categoryName: row.category?.name ?? null,
    primaryImageUrl: primary?.url ?? null,
    totalStock,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
  };
}

export async function listAdminProducts(
  supabase: Client,
  filters: AdminProductFilters
): Promise<AdminProductListItem[]> {
  let query = supabase.from("products").select(LIST_SELECT);

  if (filters.view === "deleted") {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }
  if (filters.q) {
    const term = filters.q.replace(/[%,]/g, "");
    query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.brandId) query = query.eq("brand_id", filters.brandId);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.isFeatured) query = query.eq("is_featured", true);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as ListRow[]).map(mapListRow);
}

const DETAIL_SELECT = `
  id, sku, name, slug, description, brand_id, category_id,
  regular_price, sale_price, eur_regular_price, eur_sale_price, weight_grams, tags,
  is_featured, is_new_arrival, is_on_sale, status, seo_title, seo_description,
  images:product_images ( id, url, display_order, is_featured ),
  sizes:product_sizes ( id, size, inventory ( id, quantity, low_stock_threshold ) )
`;

type DetailRow = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  brand_id: string | null;
  category_id: string | null;
  regular_price: number;
  sale_price: number | null;
  eur_regular_price: number | null;
  eur_sale_price: number | null;
  weight_grams: number | null;
  tags: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  status: ProductStatus;
  seo_title: string | null;
  seo_description: string | null;
  images: { id: string; url: string; display_order: number; is_featured: boolean }[];
  sizes: { id: string; size: string; inventory: { id: string; quantity: number; low_stock_threshold: number } | null }[];
};

export async function getAdminProductById(
  supabase: Client,
  id: string
): Promise<AdminProductDetail | null> {
  const { data, error } = await supabase
    .from("products")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as DetailRow;
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    description: row.description,
    brandId: row.brand_id,
    categoryId: row.category_id,
    regularPrice: row.regular_price,
    salePrice: row.sale_price,
    eurRegularPrice: row.eur_regular_price,
    eurSalePrice: row.eur_sale_price,
    weightGrams: row.weight_grams,
    tags: row.tags,
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
    isOnSale: row.is_on_sale,
    status: row.status,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    images: [...row.images]
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => ({
        id: img.id,
        url: img.url,
        displayOrder: img.display_order,
        isFeatured: img.is_featured,
      })),
    sizes: row.sizes.map((s) => ({
      id: s.id,
      size: s.size,
      quantity: s.inventory?.quantity ?? 0,
      lowStockThreshold: s.inventory?.low_stock_threshold ?? 5,
    })),
  };
}
