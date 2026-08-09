"use client";

import type { ProductSizeStock } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function SizeSelector({
  sizes,
  selected,
  onSelect,
}: {
  sizes: ProductSizeStock[];
  selected: string | null;
  onSelect: (size: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((s) => {
        const outOfStock = s.stock === 0;
        return (
          <button
            key={s.size}
            type="button"
            disabled={outOfStock}
            aria-pressed={selected === s.size}
            onClick={() => onSelect(s.size)}
            className={cn(
              "flex h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
              outOfStock
                ? "cursor-not-allowed border-border text-muted-foreground line-through opacity-50"
                : selected === s.size
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:border-primary"
            )}
          >
            {s.size}
          </button>
        );
      })}
    </div>
  );
}
