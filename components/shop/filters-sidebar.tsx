"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCatalogFacets } from "@/lib/catalog/hooks";
import { cn } from "@/lib/utils";

/** Set `lockedFacet` on category/brand landing pages to hide that filter group (it's fixed by the route). */
export function FiltersSidebar({
  lockedFacet,
}: {
  lockedFacet?: "brand" | "category";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: facets } = useCatalogFacets();
  const brands = facets?.brands ?? [];
  const categories = facets?.categories ?? [];
  const sizes = facets?.sizes ?? [];
  const priceBounds = { min: facets?.minPrice ?? 0, max: facets?.maxPrice ?? 2000 };

  const selectedBrands = searchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const selectedCategories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const selectedSizes = searchParams.get("size")?.split(",").filter(Boolean) ?? [];
  const inStock = searchParams.get("inStock") === "1";

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleListParam(key: string, value: string, current: string[]) {
    updateParams((params) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length > 0) params.set(key, next.join(","));
      else params.delete(key);
    });
  }

  function applyPriceRange() {
    updateParams((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    });
  }

  function clearAll() {
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  }

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    inStock ||
    !!searchParams.get("minPrice") ||
    !!searchParams.get("maxPrice");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto p-0 text-xs text-secondary hover:text-secondary">
            Clear All
          </Button>
        )}
      </div>

      {lockedFacet !== "brand" && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Brand
            </h3>
            <div className="space-y-2">
              {brands.map((brand) => {
                const checked = selectedBrands.includes(brand.slug);
                return (
                  <div key={brand.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${brand.slug}`}
                      checked={checked}
                      onCheckedChange={() => toggleListParam("brand", brand.slug, selectedBrands)}
                    />
                    <Label htmlFor={`brand-${brand.slug}`} className="text-sm font-normal text-foreground">
                      {brand.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {lockedFacet !== "category" && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const checked = selectedCategories.includes(category.slug);
                return (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${category.slug}`}
                      checked={checked}
                      onCheckedChange={() =>
                        toggleListParam("category", category.slug, selectedCategories)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.slug}`}
                      className="text-sm font-normal text-foreground"
                    >
                      {category.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <Separator />
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const selected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleListParam("size", size, selectedSizes)}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-primary"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Price Range (GHS)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={String(priceBounds.min)}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder={String(priceBounds.max)}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={applyPriceRange}>
          Apply
        </Button>
      </div>

      <Separator />
      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={inStock}
          onCheckedChange={() =>
            updateParams((params) => {
              if (inStock) params.delete("inStock");
              else params.set("inStock", "1");
            })
          }
        />
        <Label htmlFor="in-stock" className="text-sm font-normal text-foreground">
          In Stock Only
        </Label>
      </div>
    </div>
  );
}
