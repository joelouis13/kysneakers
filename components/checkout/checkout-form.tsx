"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useProductsBySlugs } from "@/lib/catalog/hooks";
import type { ProductDetail } from "@/lib/catalog/types";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { placeOrder } from "@/lib/checkout/actions";
import { getAddresses } from "@/lib/checkout/queries";
import { checkoutSchema, type CheckoutValues } from "@/lib/checkout/schemas";
import { useShippingZones } from "@/lib/checkout/hooks";
import { setStashedContact } from "@/lib/checkout/session-contact";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const PAYMENT_METHODS = [
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "telecel_cash", label: "Telecel Cash" },
  { value: "airteltigo_money", label: "AirtelTigo Money" },
] as const;

function useOwnAddresses() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: ["addresses", user?.id ?? null],
    queryFn: () => getAddresses(supabase),
    enabled: !!user,
  });
}

export function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeItems, couponCode } = useCart();
  const { data: zones, isLoading: zonesLoading } = useShippingZones();
  const { data: addresses } = useOwnAddresses();

  const slugs = useMemo(() => [...new Set(activeItems.map((i) => i.productSlug))], [activeItems]);
  const { data: products, isLoading: productsLoading } = useProductsBySlugs(slugs);

  const productBySlug = useMemo(() => {
    const map = new Map<string, ProductDetail>();
    for (const p of products ?? []) map.set(p.slug, p);
    return map;
  }, [products]);

  const subtotal = useMemo(() => {
    return activeItems.reduce((sum, item) => {
      const product = productBySlug.get(item.productSlug);
      return product ? sum + product.effectivePrice * item.quantity : sum;
    }, 0);
  }, [activeItems, productBySlug]);

  // null = user hasn't manually chosen yet, so fall back to the first saved
  // address once it loads (derived each render, no effect needed).
  const [manualAddressId, setManualAddressId] = useState<string | null>(null);
  const [manualUseNewAddress, setManualUseNewAddress] = useState<boolean | null>(null);

  const hasAddresses = (addresses?.length ?? 0) > 0;
  const useNewAddress = manualUseNewAddress ?? !hasAddresses;
  const selectedAddressId = manualAddressId ?? addresses?.[0]?.id ?? null;

  function selectAddress(id: string) {
    setManualAddressId(id);
    setManualUseNewAddress(false);
  }

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.user_metadata?.full_name ?? "",
      customerEmail: user?.email ?? "",
      paymentMethod: "mtn_momo",
      items: [],
    },
  });

  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  async function onSubmit(values: CheckoutValues) {
    const payload: CheckoutValues = {
      ...values,
      couponCode: couponCode ?? undefined,
      items: activeItems.map((i) => ({
        productSlug: i.productSlug,
        size: i.size,
        quantity: i.quantity,
      })),
      shipping:
        !useNewAddress && selectedAddressId
          ? { addressId: selectedAddressId }
          : values.shipping,
    };

    const result = await placeOrder(payload);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setStashedContact(result.order.orderNumber, result.order.customerEmail);
    router.push(`/checkout/confirmation/${result.order.orderNumber}`);
  }

  const isLoading = zonesLoading || productsLoading;

  if (activeItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Your cart is empty.{" "}
        <Link href="/shop" className="font-medium text-foreground hover:underline">
          Continue shopping
        </Link>
        .
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5">Full Name</Label>
              <Input aria-invalid={!!errors.customerName} {...register("customerName")} />
              {errors.customerName && (
                <p className="mt-1.5 text-xs text-destructive">{errors.customerName.message}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5">Email</Label>
              <Input type="email" aria-invalid={!!errors.customerEmail} {...register("customerEmail")} />
              {errors.customerEmail && (
                <p className="mt-1.5 text-xs text-destructive">{errors.customerEmail.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Phone</Label>
              <Input aria-invalid={!!errors.customerPhone} {...register("customerPhone")} />
              {errors.customerPhone && (
                <p className="mt-1.5 text-xs text-destructive">{errors.customerPhone.message}</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">
            Shipping Address
          </h2>

          {addresses && addresses.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => selectAddress(addr.id)}
                  className={
                    !useNewAddress && selectedAddressId === addr.id
                      ? "rounded-md border border-primary bg-primary px-3 py-2 text-left text-xs text-primary-foreground"
                      : "rounded-md border border-border px-3 py-2 text-left text-xs text-foreground hover:border-primary"
                  }
                >
                  <p className="font-medium">{addr.label}</p>
                  <p className="text-[11px] opacity-80">{addr.street_address}, {addr.city}</p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setManualUseNewAddress(true)}
                className={
                  useNewAddress
                    ? "rounded-md border border-primary bg-primary px-3 py-2 text-xs text-primary-foreground"
                    : "rounded-md border border-dashed border-border px-3 py-2 text-xs text-foreground hover:border-primary"
                }
              >
                + New address
              </button>
            </div>
          )}

          {useNewAddress && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5">Recipient Name</Label>
                <Input aria-invalid={!!errors.shipping?.recipientName} {...register("shipping.recipientName")} />
              </div>
              <div>
                <Label className="mb-1.5">Phone</Label>
                <Input aria-invalid={!!errors.shipping?.phone} {...register("shipping.phone")} />
              </div>
              <div>
                <Label className="mb-1.5">Region</Label>
                <Input aria-invalid={!!errors.shipping?.region} {...register("shipping.region")} />
              </div>
              <div>
                <Label className="mb-1.5">City</Label>
                <Input aria-invalid={!!errors.shipping?.city} {...register("shipping.city")} />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5">Street Address</Label>
                <Input aria-invalid={!!errors.shipping?.streetAddress} {...register("shipping.streetAddress")} />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5">Landmark (optional)</Label>
                <Input {...register("shipping.landmark")} />
              </div>
              {errors.shipping?.recipientName && (
                <p className="text-xs text-destructive sm:col-span-2">
                  {errors.shipping.recipientName.message}
                </p>
              )}
              {user && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Checkbox
                    id="saveAddress"
                    onCheckedChange={(checked) => setValue("shipping.saveAddress", checked === true)}
                  />
                  <Label htmlFor="saveAddress" className="text-xs font-normal">
                    Save this address for next time
                  </Label>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">
            Delivery Zone
          </h2>
          <Select onValueChange={(v) => setValue("shippingZoneId", v)}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Select a delivery zone" />
            </SelectTrigger>
            <SelectContent>
              {(zones ?? []).map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name} — {currency.format(zone.deliveryFee)} ({zone.estimatedDaysMin}-
                  {zone.estimatedDaysMax} days)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.shippingZoneId && (
            <p className="mt-1.5 text-xs text-destructive">{errors.shippingZoneId.message}</p>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">
            Payment Method
          </h2>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                aria-pressed={paymentMethod === m.value}
                onClick={() => setValue("paymentMethod", m.value)}
                className={
                  paymentMethod === m.value
                    ? "rounded-md border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                    : "rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary"
                }
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="mt-4 max-w-xs">
            <Label className="mb-1.5">Mobile Money Number</Label>
            <Input aria-invalid={!!errors.payerPhone} {...register("payerPhone")} />
            {errors.payerPhone && (
              <p className="mt-1.5 text-xs text-destructive">{errors.payerPhone.message}</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">
            Order Notes (optional)
          </h2>
          <Textarea rows={3} {...register("notes")} />
        </section>
      </div>

      <div className="h-fit space-y-4 rounded-xl border border-border p-6">
        <h2 className="font-heading text-xl tracking-wide text-foreground">Order Summary</h2>
        <div className="space-y-2 text-sm">
          {activeItems.map((item) => {
            const product = productBySlug.get(item.productSlug);
            if (!product) return null;
            return (
              <div key={`${item.productSlug}-${item.size}`} className="flex justify-between text-muted-foreground">
                <span>
                  {product.name} · {item.size} × {item.quantity}
                </span>
                <span className="text-foreground">
                  {currency.format(product.effectivePrice * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-foreground">{currency.format(subtotal)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Delivery fee and any discount are calculated on the confirmed order.
        </p>
        <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={isSubmitting}>
          Place Order
        </Button>
      </div>
    </form>
  );
}
