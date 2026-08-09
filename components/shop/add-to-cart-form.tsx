"use client";

import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SizeSelector } from "@/components/shop/size-selector";
import type { ProductDetail } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";

export function AddToCartForm({ product }: { product: ProductDetail }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedStock = product.sizes.find((s) => s.size === selectedSize)?.stock ?? 0;
  const isWishlisted = has(product.slug);

  function selectSize(size: string) {
    setSelectedSize(size);
    setQuantity(1);
  }

  function handleAddToCart() {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addItem(product.slug, selectedSize, quantity);
    toast.success(`${product.name} (Size ${selectedSize}) added to cart`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Select Size</h3>
        <SizeSelector sizes={product.sizes} selected={selectedSize} onSelect={selectSize} />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-md border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-10 items-center justify-center text-foreground hover:bg-accent"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() =>
              setQuantity((q) => Math.min(selectedSize ? selectedStock : 99, q + 1))
            }
            className="flex size-10 items-center justify-center text-foreground hover:bg-accent"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {selectedSize && (
          <span className="text-xs text-muted-foreground">
            {selectedStock > 0 ? `${selectedStock} in stock` : "Out of stock"}
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          variant="secondary"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!!selectedSize && selectedStock === 0}
        >
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          onClick={() => toggle(product.slug)}
        >
          <Heart className={cn("size-5", isWishlisted && "fill-secondary text-secondary")} />
        </Button>
      </div>
    </div>
  );
}
