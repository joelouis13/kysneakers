import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type {
  CatalogFacets,
  ProductBrand,
  ProductCategoryRef,
  ProductDetail,
  ProductImageItem,
  ProductQueryParams,
  ProductQueryResult,
  ProductSizeStock,
  ProductSummary,
} from "./types";

type Client = SupabaseClient<Database>;

const DEFAULT_PER_PAGE = 12;

type SearchProductsRow = Database["public"]["Functions"]["search_products"]["Returns"][number];

function mapSummaryRow(row: SearchProductsRow): ProductSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brandName: row.brand_name,
    primaryImageUrl: row.primary_image_url,
    regularPrice: row.regular_price,
    salePrice: row.sale_price,
    effectivePrice: row.effective_price,
    eurRegularPrice: row.eur_regular_price,
    eurSalePrice: row.eur_sale_price,
    eurEffectivePrice: row.eur_effective_price,
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
    isOnSale: row.is_on_sale,
    isFlashSale: row.is_flash_sale,
    totalStock: row.total_stock,
    sku: row.sku,
    description: row.description,
    brand:
      row.brand_id && row.brand_name && row.brand_slug
        ? { id: row.brand_id, name: row.brand_name, slug: row.brand_slug }
        : null,
    category:
      row.category_id && row.category_name && row.category_slug
        ? { id: row.category_id, name: row.category_name, slug: row.category_slug }
        : null,
    tags: row.tags,
    reviewCount: row.review_count,
    ratingAvg: row.rating_avg,
    createdAt: row.created_at,
  };
}

/**
 * Shared filter/sort/paginate over the real catalog, via the search_products
 * RPC. Every listing route (/shop, /categories/[slug], /brands/[slug],
 * /search, related products, home strips) goes through this.
 */
export async function queryProducts(
  supabase: Client,
  params: ProductQueryParams
): Promise<ProductQueryResult> {
  const {
    q,
    brand = [],
    category = [],
    size = [],
    minPrice,
    maxPrice,
    inStock,
    isFeatured,
    isNewArrival,
    isOnSale,
    isFlashSale,
    excludeId,
    sort = "newest",
    page = 1,
    perPage = DEFAULT_PER_PAGE,
    isGhana = false,
  } = params;

  const { data, error } = await supabase.rpc("search_products", {
    p_q: q || null,
    p_brand_slugs: brand.length ? brand : null,
    p_category_slugs: category.length ? category : null,
    p_sizes: size.length ? size : null,
    p_min_price: minPrice ?? null,
    p_max_price: maxPrice ?? null,
    p_in_stock: inStock ?? null,
    p_is_featured: isFeatured ?? null,
    p_is_new_arrival: isNewArrival ?? null,
    p_is_on_sale: isOnSale ?? null,
    p_is_flash_sale: isFlashSale ?? null,
    p_exclude_id: excludeId ?? null,
    p_sort: sort,
    p_limit: perPage,
    p_offset: (Math.max(1, page) - 1) * perPage,
    p_is_ghana: isGhana,
  });
  if (error) throw error;

  const rows = data ?? [];
  // total_count rides along on every row (a window function in the RPC); if
  // `page` is past the end, rows is empty and we have no way to recover the
  // real total without a second round trip — acceptable since pagination
  // links are always built from a previously-known totalPages.
  const total = rows[0]?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    products: rows.map(mapSummaryRow),
    total,
    page,
    perPage,
    totalPages,
  };
}

export async function getFeaturedProducts(supabase: Client, perPage = 8, isGhana = false) {
  return (await queryProducts(supabase, { isFeatured: true, sort: "newest", perPage, isGhana })).products;
}

export async function getNewArrivals(supabase: Client, perPage = 8, isGhana = false) {
  return (await queryProducts(supabase, { isNewArrival: true, sort: "newest", perPage, isGhana })).products;
}

export async function getOnSaleProducts(supabase: Client, perPage = 8, isGhana = false) {
  return (await queryProducts(supabase, { isOnSale: true, sort: "newest", perPage, isGhana })).products;
}

export async function getFlashSaleProducts(supabase: Client, perPage = 8, isGhana = false) {
  return (await queryProducts(supabase, { isFlashSale: true, sort: "newest", perPage, isGhana })).products;
}

/** No real order history yet — "popular" ranks by real review count. */
export async function getBestSellers(supabase: Client, perPage = 8, isGhana = false) {
  return (await queryProducts(supabase, { sort: "popular", perPage, isGhana })).products;
}

export async function getBrands(supabase: Client): Promise<ProductBrand[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("id,name,slug")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export type CategoryWithImage = ProductCategoryRef & { imageUrl: string | null };

export async function getCategories(supabase: Client): Promise<CategoryWithImage[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,image_url")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw error;
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug, imageUrl: c.image_url }));
}

export type BrandWithCount = ProductBrand & { productCount: number };

/**
 * Embedded PostgREST count of each brand's products — scoped by whatever RLS
 * allows the calling role to see (active-only for anon/customer, everything
 * for staff). Fine for the public /brands index; a staff member browsing the
 * storefront while logged in would see an inflated count, which is an
 * acceptable edge case since staff use the admin dashboard, not this page.
 */
export async function getBrandsWithCounts(supabase: Client): Promise<BrandWithCount[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("id,name,slug,products(count)")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    productCount: (b.products as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));
}

export type CategoryWithCount = CategoryWithImage & { productCount: number };

export async function getCategoriesWithCounts(supabase: Client): Promise<CategoryWithCount[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,image_url,products(count)")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.image_url,
    productCount: (c.products as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));
}

export async function getBrandBySlug(supabase: Client, slug: string): Promise<ProductBrand | null> {
  const { data, error } = await supabase
    .from("brands")
    .select("id,name,slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(
  supabase: Client,
  slug: string
): Promise<ProductCategoryRef | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCatalogFacets(supabase: Client): Promise<CatalogFacets> {
  const { data, error } = await supabase.rpc("get_catalog_facets");
  if (error) throw error;
  const row = data?.[0];
  return {
    sizes: row?.sizes ?? [],
    brands: row?.brands ?? [],
    categories: row?.categories ?? [],
    minPrice: row?.min_price ?? 0,
    maxPrice: row?.max_price ?? 0,
  };
}

const PRODUCT_DETAIL_SELECT = `
  id, sku, name, slug, description, tags,
  regular_price, sale_price, eur_regular_price, eur_sale_price, is_featured, is_new_arrival, is_on_sale, is_flash_sale,
  brand:brands ( id, name, slug ),
  category:categories ( id, name, slug ),
  images:product_images ( id, url, display_order, is_featured ),
  sizes:product_sizes ( id, size, inventory ( quantity ) )
`;

type ProductDetailRow = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  tags: string[];
  regular_price: number;
  sale_price: number | null;
  eur_regular_price: number | null;
  eur_sale_price: number | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  is_flash_sale: boolean;
  brand: ProductBrand | null;
  category: ProductCategoryRef | null;
  images: { id: string; url: string; display_order: number; is_featured: boolean }[];
  sizes: { id: string; size: string; inventory: { quantity: number } | null }[];
};

async function getReviewStats(
  supabase: Client,
  productId: string
): Promise<{ reviewCount: number; ratingAvg: number | null }> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "approved");
  if (error) throw error;
  const ratings = data ?? [];
  if (ratings.length === 0) return { reviewCount: 0, ratingAvg: null };
  const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  return { reviewCount: ratings.length, ratingAvg: avg };
}

function mapDetailRow(
  row: ProductDetailRow,
  reviewStats: { reviewCount: number; ratingAvg: number | null }
): ProductDetail {
  const images: ProductImageItem[] = [...row.images]
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      id: img.id,
      url: img.url,
      displayOrder: img.display_order,
      isFeatured: img.is_featured,
    }));

  const sizes: ProductSizeStock[] = row.sizes.map((s) => ({
    id: s.id,
    size: s.size,
    stock: s.inventory?.quantity ?? 0,
  }));

  const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);
  const primaryImage = images.find((i) => i.isFeatured) ?? images[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brandName: row.brand?.name ?? null,
    primaryImageUrl: primaryImage?.url ?? null,
    regularPrice: row.regular_price,
    salePrice: row.sale_price,
    effectivePrice: row.sale_price ?? row.regular_price,
    eurRegularPrice: row.eur_regular_price,
    eurSalePrice: row.eur_sale_price,
    eurEffectivePrice: row.eur_sale_price ?? row.eur_regular_price,
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
    isOnSale: row.is_on_sale,
    isFlashSale: row.is_flash_sale,
    totalStock,
    sku: row.sku,
    description: row.description,
    brand: row.brand,
    category: row.category,
    tags: row.tags,
    images,
    sizes,
    reviewCount: reviewStats.reviewCount,
    ratingAvg: reviewStats.ratingAvg,
  };
}

export async function getProductBySlug(supabase: Client, slug: string): Promise<ProductDetail | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as ProductDetailRow;
  const reviewStats = await getReviewStats(supabase, row.id);
  return mapDetailRow(row, reviewStats);
}

/** Batched slug -> product lookup, used by cart and wishlist. */
export async function getProductsBySlugs(supabase: Client, slugs: string[]): Promise<ProductDetail[]> {
  if (slugs.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .in("slug", slugs)
    .eq("status", "active")
    .is("deleted_at", null);
  if (error) throw error;

  const rows = (data ?? []) as unknown as ProductDetailRow[];
  return Promise.all(
    rows.map(async (row) => mapDetailRow(row, await getReviewStats(supabase, row.id)))
  );
}

export async function getRelatedProducts(
  supabase: Client,
  product: ProductDetail,
  limit = 4,
  isGhana = false
): Promise<ProductSummary[]> {
  if (!product.category) return [];
  const { products } = await queryProducts(supabase, {
    category: [product.category.slug],
    excludeId: product.id,
    perPage: limit,
    isGhana,
  });
  return products;
}
