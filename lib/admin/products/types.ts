import type { ProductStatus } from "@/types/database";

export type AdminProductListItem = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  status: ProductStatus;
  regularPrice: number;
  salePrice: number | null;
  eurRegularPrice: number | null;
  eurSalePrice: number | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  isFlashSale: boolean;
  isInternationalOnly: boolean;
  brandName: string | null;
  categoryName: string | null;
  primaryImageUrl: string | null;
  totalStock: number;
  deletedAt: string | null;
  createdAt: string;
};

export type AdminProductImage = {
  id: string;
  url: string;
  displayOrder: number;
  isFeatured: boolean;
};

export type AdminProductSize = {
  id: string;
  size: string;
  quantity: number;
  lowStockThreshold: number;
};

/** Ordered client-side image submission — index = final display order. */
export type ImageInput =
  | { kind: "existing"; id: string; isFeatured: boolean }
  | { kind: "new"; file: File; isFeatured: boolean };

export type AdminProductDetail = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  brandId: string | null;
  categoryId: string | null;
  regularPrice: number;
  salePrice: number | null;
  eurRegularPrice: number | null;
  eurSalePrice: number | null;
  weightGrams: number | null;
  tags: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  isFlashSale: boolean;
  isInternationalOnly: boolean;
  status: ProductStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  images: AdminProductImage[];
  sizes: AdminProductSize[];
};
