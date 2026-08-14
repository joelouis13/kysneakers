"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import type { ProductCardData } from "@/lib/catalog/types";
import { useCurrency } from "@/lib/currency/currency-context";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist/wishlist-context";

function PriceDisplay({ product }: { product: ProductCardData }) {
  const { formatPrice } = useCurrency();

  if (product.salePrice) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-secondary">
          {formatPrice(product.salePrice, product.eurSalePrice)}
        </span>
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(product.regularPrice, product.eurRegularPrice)}
        </span>
      </div>
    );
  }
  return (
    <span className="text-sm font-semibold text-foreground">
      {formatPrice(product.regularPrice, product.eurRegularPrice)}
    </span>
  );
}

function WishlistButton({
  product,
  className,
}: {
  product: ProductCardData;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.slug);

  return (
    <button
      type="button"
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      onClick={(e) => {
        e.preventDefault();
        toggle(product.slug);
      }}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background",
        className
      )}
    >
      <Heart
        className={cn(
          "size-4 text-icon transition-colors",
          isWishlisted && "fill-secondary text-secondary"
        )}
      />
    </button>
  );
}

export function ProductCard({
  product,
  variant = "grid",
}: {
  product: ProductCardData;
  variant?: "grid" | "list";
}) {
  const outOfStock = product.totalStock === 0;

  if (variant === "list") {
    return (
      <div className="group flex gap-4 rounded-lg border border-border p-3 sm:p-4">
        <Link
          href={`/product/${product.slug}`}
          className="relative block size-24 shrink-0 overflow-hidden rounded-md bg-muted sm:size-32"
        >
          {product.primaryImageUrl && (
            <Image
              src={product.primaryImageUrl}
              alt={product.name}
              fill
              sizes="128px"
              className="object-cover"
            />
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground">
                Sold Out
              </span>
            </div>
          )}
        </Link>

        <div className="flex flex-1 flex-col justify-between py-0.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {product.brandName}
              </p>
              <Link href={`/product/${product.slug}`}>
                <h3 className="text-sm font-semibold text-foreground hover:underline sm:text-base">
                  {product.name}
                </h3>
              </Link>
              <p className="mt-1 hidden text-xs text-muted-foreground sm:line-clamp-2 sm:block">
                {product.description}
              </p>
            </div>
            <WishlistButton product={product} className="bg-transparent shadow-none hover:bg-accent" />
          </div>

          <div className="flex items-end justify-between gap-2">
            <PriceDisplay product={product} />
            <div className="flex gap-1.5">
              {product.isOnSale && <Badge variant="sale">Sale</Badge>}
              {product.isNewArrival && <Badge variant="secondary">New</Badge>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-lg bg-muted"
      >
        <motion.div
          className="relative h-full w-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {product.primaryImageUrl && (
            <Image
              src={product.primaryImageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
              className="object-cover"
            />
          )}
        </motion.div>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isOnSale && <Badge variant="sale">Sale</Badge>}
          {product.isNewArrival && <Badge variant="secondary">New</Badge>}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <WishlistButton product={product} className="absolute right-3 top-3" />

      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.brandName}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-foreground hover:underline">
            {product.name}
          </h3>
        </Link>
        <PriceDisplay product={product} />
      </div>
    </div>
  );
}
