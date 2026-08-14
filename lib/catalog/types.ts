export type ProductBrand = { id: string; name: string; slug: string };
export type ProductCategoryRef = { id: string; name: string; slug: string };

/** Minimum shape ProductCard/ProductSection need — both ProductSummary and ProductDetail satisfy this. */
export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  brandName: string | null;
  primaryImageUrl: string | null;
  regularPrice: number;
  salePrice: number | null;
  effectivePrice: number;
  /** Admin-set EUR overrides — null means "auto-convert from GHS at the live rate" (lib/currency's formatPrice handles the fallback). */
  eurRegularPrice: number | null;
  eurSalePrice: number | null;
  eurEffectivePrice: number | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  totalStock: number;
};

/** Listing/search/related/home-strip results — from the search_products RPC. */
export type ProductSummary = ProductCardData & {
  sku: string;
  brand: ProductBrand | null;
  category: ProductCategoryRef | null;
  tags: string[];
  reviewCount: number;
  ratingAvg: number | null;
  createdAt: string;
};

export type ProductSizeStock = { id: string; size: string; stock: number };
export type ProductImageItem = { id: string; url: string; displayOrder: number; isFeatured: boolean };

/** Product page + cart/wishlist batched lookups — full images/sizes, nested brand/category. */
export type ProductDetail = ProductCardData & {
  sku: string;
  brand: ProductBrand | null;
  category: ProductCategoryRef | null;
  tags: string[];
  images: ProductImageItem[];
  sizes: ProductSizeStock[];
  reviewCount: number;
  ratingAvg: number | null;
};

export type ProductSortOption = "newest" | "popular" | "price-asc" | "price-desc";

export type ProductQueryParams = {
  q?: string;
  brand?: string[];
  category?: string[];
  size?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
  excludeId?: string;
  sort?: ProductSortOption;
  page?: number;
  perPage?: number;
};

export type ProductQueryResult = {
  products: ProductSummary[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type CatalogFacets = {
  sizes: string[];
  brands: ProductBrand[];
  categories: ProductCategoryRef[];
  minPrice: number;
  maxPrice: number;
};
