import type { ProductQueryParams, ProductSortOption } from "./types";

type RawSearchParams = { [key: string]: string | string[] | undefined };

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function listValue(v: string | string[] | undefined): string[] {
  if (!v) return [];
  const raw = Array.isArray(v) ? v.join(",") : v;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Normalizes a Next.js `searchParams` object into `ProductQueryParams`. */
export function parseProductSearchParams(sp: RawSearchParams): ProductQueryParams {
  const minPrice = firstValue(sp.minPrice);
  const maxPrice = firstValue(sp.maxPrice);
  const page = firstValue(sp.page);
  const sort = firstValue(sp.sort) as ProductSortOption | undefined;

  return {
    q: firstValue(sp.q),
    brand: listValue(sp.brand),
    category: listValue(sp.category),
    size: listValue(sp.size),
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock: firstValue(sp.inStock) === "1",
    sort: sort && ["newest", "popular", "price-asc", "price-desc"].includes(sort) ? sort : undefined,
    page: page ? Number(page) : undefined,
  };
}
