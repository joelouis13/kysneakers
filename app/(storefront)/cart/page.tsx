"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CouponForm } from "@/components/cart/coupon-form";
import { OrderSummary } from "@/components/cart/order-summary";
import { DeliveryMethodSelect, type DeliveryMethod } from "@/components/checkout/delivery-method-select";
import { useProductsBySlugs } from "@/lib/catalog/hooks";
import type { ProductDetail } from "@/lib/catalog/types";
import { useCart } from "@/lib/cart/cart-context";
import { FLAT_DELIVERY_FEE } from "@/lib/checkout/constants";
import { useCouponPreview } from "@/lib/checkout/hooks";
import { useCurrency } from "@/lib/currency/currency-context";
import { convert } from "@/lib/currency/rates";
import { resolveProductPrice } from "@/lib/currency/product-price";

export default function CartPage() {
  const router = useRouter();
  const { items, activeItems, savedItems, couponCode } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const { currency, isGhana, rates } = useCurrency();

  const slugs = useMemo(() => [...new Set(items.map((i) => i.productSlug))], [items]);
  const { data: products, isLoading } = useProductsBySlugs(slugs);

  const productBySlug = useMemo(() => {
    const map = new Map<string, ProductDetail>();
    for (const product of products ?? []) map.set(product.slug, product);
    return map;
  }, [products]);

  // GHS basis — coupon minimum-purchase/discount_value are GHS-denominated
  // business config (lib/checkout/queries.ts's getCouponPreview), unaffected
  // by any product's manual EUR price.
  const subtotalGhs = useMemo(() => {
    return activeItems.reduce((sum, item) => {
      const product = productBySlug.get(item.productSlug);
      return product ? sum + product.effectivePrice * item.quantity : sum;
    }, 0);
  }, [activeItems, productBySlug]);

  // Display/charge basis — per-line resolved to the visitor's currency,
  // honoring each product's manual EUR price when one is set (see
  // lib/currency/product-price.ts; the same function placeOrder uses).
  const subtotal = useMemo(() => {
    return activeItems.reduce((sum, item) => {
      const product = productBySlug.get(item.productSlug);
      if (!product) return sum;
      const unitPrice = resolveProductPrice(product.effectivePrice, product.eurEffectivePrice, currency, rates);
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [activeItems, productBySlug, currency, rates]);

  const { data: couponPreview } = useCouponPreview(couponCode ?? "", subtotalGhs);
  const discountGhs = couponPreview?.valid ? couponPreview.discount : 0;
  const discount = isGhana ? discountGhs : convert(discountGhs, currency, rates);
  const deliveryFeeGhs =
    activeItems.length > 0 && deliveryMethod === "delivery" ? FLAT_DELIVERY_FEE : 0;
  const deliveryFee = isGhana ? deliveryFeeGhs : convert(deliveryFeeGhs, currency, rates);
  const total = Math.max(0, subtotal - discount) + deliveryFee;
  const itemCount = activeItems.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="size-12 text-icon" />
        <h1 className="mt-4 font-heading text-2xl tracking-wide text-foreground">
          Your cart is empty
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Button size="lg" variant="secondary" className="mt-6" asChild>
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Shopping Cart</h1>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5 rounded-xl border border-border p-5">
            {items.map((item) => (
              <Skeleton key={`${item.productSlug}-${item.size}`} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {activeItems.length > 0 ? (
            <div className="rounded-xl border border-border px-5">
              {activeItems.map((item) => (
                <CartItemRow
                  key={`${item.productSlug}-${item.size}`}
                  item={item}
                  product={productBySlug.get(item.productSlug)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              All items saved for later. Move something back to your cart to check out.
            </div>
          )}

          {savedItems.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Saved for Later ({savedItems.length})
              </h2>
              <div className="rounded-xl border border-border px-5">
                {savedItems.map((item) => (
                  <CartItemRow
                    key={`${item.productSlug}-${item.size}`}
                    item={item}
                    product={productBySlug.get(item.productSlug)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border p-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Coupon Code</h2>
            <CouponForm subtotal={subtotalGhs} />
          </div>

          <div className="rounded-xl border border-border p-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Delivery Method</h2>
            <DeliveryMethodSelect value={deliveryMethod} onChange={setDeliveryMethod} />
          </div>

          <OrderSummary
            subtotal={subtotal}
            discount={discount}
            deliveryFee={deliveryFee}
            total={total}
            itemCount={itemCount}
            actionSlot={
              <Button size="lg" variant="secondary" className="w-full" onClick={() => router.push("/checkout")}>
                Proceed to Checkout
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
