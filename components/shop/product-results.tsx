"use client";

import { Grid2x2, List } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import type { ProductSummary } from "@/lib/catalog/types";

export function ProductResults({ products }: { products: ProductSummary[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <p className="text-lg font-semibold text-foreground">No products found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end gap-1">
        <Button
          variant={view === "grid" ? "outline" : "ghost"}
          size="icon-sm"
          aria-label="Grid view"
          aria-pressed={view === "grid"}
          onClick={() => setView("grid")}
        >
          <Grid2x2 className="size-4" />
        </Button>
        <Button
          variant={view === "list" ? "outline" : "ghost"}
          size="icon-sm"
          aria-label="List view"
          aria-pressed={view === "list"}
          onClick={() => setView("list")}
        >
          <List className="size-4" />
        </Button>
      </div>

      <div
        className={
          view === "grid"
            ? "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4"
            : "flex flex-col gap-3"
        }
      >
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} variant={view} />
        ))}
      </div>
    </div>
  );
}
