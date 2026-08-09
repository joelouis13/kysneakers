"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductDetail } from "@/lib/catalog/types";
import { useCart, type CartItem } from "@/lib/cart/cart-context";

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export function CartItemRow({
  item,
  product,
}: {
  item: CartItem;
  product: ProductDetail | undefined;
}) {
  const { updateQuantity, removeItem, toggleSavedForLater } = useCart();

  if (!product) {
    return <Skeleton className="h-24 w-full" />;
  }

  const size = product.sizes.find((s) => s.size === item.size);
  const stock = size?.stock ?? 0;
  const price = product.effectivePrice;

  return (
    <div className="flex gap-4 border-b border-border py-5 first:pt-0 last:border-b-0">
      <Link
        href={`/product/${product.slug}`}
        className="relative block size-24 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        {product.primaryImageUrl && (
          <Image
            src={product.primaryImageUrl}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.brandName}
            </p>
            <Link href={`/product/${product.slug}`}>
              <h3 className="text-sm font-semibold text-foreground hover:underline">
                {product.name}
              </h3>
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">Size {item.size}</p>
          </div>
          <button
            type="button"
            aria-label="Remove item"
            onClick={() => removeItem(item.productSlug, item.size)}
            className="text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {!item.savedForLater && (
              <div className="flex items-center rounded-md border border-border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(item.productSlug, item.size, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="flex size-8 items-center justify-center text-foreground hover:bg-accent disabled:opacity-40"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(item.productSlug, item.size, item.quantity + 1)}
                  disabled={item.quantity >= stock}
                  className="flex size-8 items-center justify-center text-foreground hover:bg-accent disabled:opacity-40"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => toggleSavedForLater(item.productSlug, item.size)}
            >
              {item.savedForLater ? "Move to Cart" : "Save for Later"}
            </Button>
          </div>

          <span className="text-sm font-semibold text-foreground">
            {currency.format(price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
