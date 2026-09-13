"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { toast } from "sonner";

import { OrderSummary } from "@/components/cart/order-summary";
import { CheckoutSteps, type CheckoutStep } from "@/components/checkout/checkout-steps";
import { DeliveryMethodSelect } from "@/components/checkout/delivery-method-select";
import { GhPhoneInput } from "@/components/checkout/gh-phone-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useProductsBySlugs } from "@/lib/catalog/hooks";
import type { ProductDetail } from "@/lib/catalog/types";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { placeOrder } from "@/lib/checkout/actions";
import { FLAT_DELIVERY_FEE, FLAT_INTERNATIONAL_DELIVERY_FEE_USD, MIN_ORDER_TOTAL_EUR } from "@/lib/checkout/constants";
import { getAddresses } from "@/lib/checkout/queries";
import { checkoutSchema, type CheckoutValues } from "@/lib/checkout/schemas";
import { useCouponPreview } from "@/lib/checkout/hooks";
import { setStashedContact } from "@/lib/checkout/session-contact";
import { useCurrency } from "@/lib/currency/currency-context";
import { resolveProductPrice } from "@/lib/currency/product-price";
import { convert, convertBetween } from "@/lib/currency/rates";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const PAYMENT_METHODS = [
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "telecel_cash", label: "Telecel Cash" },
  { value: "airteltigo_money", label: "AirtelTigo Money" },
] as const;

const STEP_FIELDS: Record<CheckoutStep, FieldPath<CheckoutValues>[]> = {
  shipping: ["customerName", "customerEmail", "customerPhone", "shipping"],
  delivery: ["deliveryMethod"],
  payment: ["paymentMethod", "payerPhone"],
};

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
  const { currency, isGhana, rates, formatPrice, formatFromUsd, formatFromEur } = useCurrency();
  const { activeItems, couponCode } = useCart();
  const { data: addresses } = useOwnAddresses();

  const slugs = useMemo(() => [...new Set(activeItems.map((i) => i.productSlug))], [activeItems]);
  const { data: products, isLoading: productsLoading } = useProductsBySlugs(slugs);

  const productBySlug = useMemo(() => {
    const map = new Map<string, ProductDetail>();
    for (const p of products ?? []) map.set(p.slug, p);
    return map;
  }, [products]);

  // GHS basis — coupon minimum-purchase/discount_value are GHS-denominated.
  const subtotalGhs = useMemo(() => {
    return activeItems.reduce((sum, item) => {
      const product = productBySlug.get(item.productSlug);
      return product ? sum + product.effectivePrice * item.quantity : sum;
    }, 0);
  }, [activeItems, productBySlug]);

  // Display/charge basis — per-line resolved to the order's currency,
  // honoring each product's manual EUR price when set (same function
  // placeOrder uses server-side, so preview and real charge can't drift).
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

  // null = user hasn't manually chosen yet, so fall back to the first saved
  // address once it loads (derived each render, no effect needed).
  const [manualAddressId, setManualAddressId] = useState<string | null>(null);
  const [manualUseNewAddress, setManualUseNewAddress] = useState<boolean | null>(null);

  const hasAddresses = isGhana && (addresses?.length ?? 0) > 0;
  const useNewAddress = manualUseNewAddress ?? !hasAddresses;
  const selectedAddressId = manualAddressId ?? addresses?.[0]?.id ?? null;

  function selectAddress(id: string) {
    setManualAddressId(id);
    setManualUseNewAddress(false);
  }

  const [step, setStep] = useState<CheckoutStep>("shipping");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      currency,
      customerName: user?.user_metadata?.full_name ?? "",
      customerEmail: user?.email ?? "",
      paymentMethod: isGhana ? "mtn_momo" : "card",
      deliveryMethod: isGhana ? undefined : "international",
      items: [],
    },
  });

  // Currency is resolved once server-side and doesn't change mid-session, but
  // keep the form's declared market in sync in case this component ever
  // mounts before that resolves.
  useEffect(() => {
    setValue("currency", currency);
    setValue("paymentMethod", isGhana ? "mtn_momo" : "card");
    if (!isGhana) setValue("deliveryMethod", "international", { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, isGhana]);

  // The form's own `items` field (validated by checkoutSchema on submit)
  // must mirror the real cart — it's never set anywhere else, and a stale
  // empty default here silently fails validation on every submit attempt
  // with no visible error (root cause of "Place Order does nothing").
  useEffect(() => {
    setValue(
      "items",
      activeItems.map((i) => ({ productSlug: i.productSlug, size: i.size, quantity: i.quantity })),
      { shouldValidate: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItems]);

  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const deliveryMethod = useWatch({ control, name: "deliveryMethod" });

  const deliveryFee =
    deliveryMethod === "delivery"
      ? FLAT_DELIVERY_FEE
      : deliveryMethod === "international"
        ? convertBetween(FLAT_INTERNATIONAL_DELIVERY_FEE_USD, "USD", currency, rates)
        : 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;
  const itemCount = activeItems.reduce((sum, i) => sum + i.quantity, 0);

  const minOrderTotal = convertBetween(MIN_ORDER_TOTAL_EUR, "EUR", currency, rates);
  const belowMinimum = total < minOrderTotal;

  const [isNavigating, setIsNavigating] = useState(false);

  async function goToNextStep() {
    setIsNavigating(true);
    try {
      const valid = await trigger(STEP_FIELDS[step]);
      if (!valid) return;
      if (step === "shipping") setStep("delivery");
      else if (step === "delivery") setStep("payment");
    } finally {
      setIsNavigating(false);
    }
  }

  function goToPreviousStep() {
    if (step === "delivery") setStep("shipping");
    else if (step === "payment") setStep("delivery");
  }

  // react-hook-form validates the WHOLE schema on submit, not just the
  // currently-visible step — if an earlier step (Shipping/Delivery) has an
  // invalid field, this fires instead of onSubmit, and silently doing
  // nothing here is exactly the "Place Order does nothing" bug: the error
  // message exists in `errors`, but its step isn't mounted so it's never
  // seen. Jump back to whichever step actually has the problem and say so.
  function onInvalid(formErrors: typeof errors) {
    if (formErrors.items) {
      toast.error("Your cart changed — please review it before placing your order.");
      return;
    }
    if (formErrors.customerName || formErrors.customerEmail || formErrors.customerPhone || formErrors.shipping) {
      setStep("shipping");
    } else if (formErrors.deliveryMethod) {
      setStep("delivery");
    }
    toast.error("Please check the highlighted fields before placing your order.");
  }

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

    let result;
    try {
      result = await placeOrder(payload);
    } catch {
      toast.error("Something went wrong placing your order. Please try again.");
      return;
    }
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    if (result.redirectUrl) {
      window.location.assign(result.redirectUrl);
      return;
    }
    setStashedContact(result.order.orderNumber, result.order.customerEmail);
    router.push(`/checkout/confirmation/${result.order.orderNumber}`);
  }

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

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const PhoneField = isGhana ? GhPhoneInput : Input;

  const sidebar = (
    <div className="h-fit space-y-6">
      <div className="space-y-2 rounded-xl border border-border p-6 text-sm">
        <h2 className="mb-2 font-heading text-xl tracking-wide text-foreground">Order Summary</h2>
        {activeItems.map((item) => {
          const product = productBySlug.get(item.productSlug);
          if (!product) return null;
          return (
            <div
              key={`${item.productSlug}-${item.size}`}
              className="flex justify-between text-muted-foreground"
            >
              <span>
                {product.name} · {item.size} × {item.quantity}
              </span>
              <span className="text-foreground">
                {formatPrice(
                  product.effectivePrice * item.quantity,
                  product.eurEffectivePrice != null ? product.eurEffectivePrice * item.quantity : null
                )}
              </span>
            </div>
          );
        })}
      </div>

      <OrderSummary
        subtotal={subtotal}
        discount={discount}
        deliveryFee={deliveryFee}
        total={total}
        itemCount={itemCount}
        actionSlot={
          step === "payment" ? (
            <div className="space-y-2">
              {belowMinimum && (
                <p className="text-xs text-destructive">
                  Minimum order amount is {formatFromEur(MIN_ORDER_TOTAL_EUR)}. Add more items to your cart to continue.
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                variant="secondary"
                className="w-full"
                disabled={isSubmitting || belowMinimum}
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? "Placing Order..." : isGhana ? "Place Order" : "Continue to Payment"}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="w-full"
              disabled={isNavigating}
              onClick={goToNextStep}
            >
              {isNavigating && <Loader2 className="size-4 animate-spin" />}
              {step === "shipping" ? "Continue to Delivery" : "Continue to Payment"}
            </Button>
          )
        }
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <CheckoutSteps current={step} />

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-8">
          {step === "shipping" && (
            <>
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
                    <Input
                      type="email"
                      aria-invalid={!!errors.customerEmail}
                      {...register("customerEmail")}
                    />
                    {errors.customerEmail && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.customerEmail.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5">Phone</Label>
                    <PhoneField
                      aria-invalid={!!errors.customerPhone}
                      {...register("customerPhone")}
                    />
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

                {isGhana && addresses && addresses.length > 0 && (
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
                        <p className="text-[11px] opacity-80">
                          {addr.street_address}, {addr.city}
                        </p>
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
                      <Input
                        aria-invalid={!!errors.shipping?.recipientName}
                        {...register("shipping.recipientName")}
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5">Phone</Label>
                      <PhoneField
                        aria-invalid={!!errors.shipping?.phone}
                        {...register("shipping.phone")}
                      />
                    </div>
                    {isGhana ? (
                      <div>
                        <Label className="mb-1.5">Region</Label>
                        <Input aria-invalid={!!errors.shipping?.region} {...register("shipping.region")} />
                      </div>
                    ) : (
                      <div>
                        <Label className="mb-1.5">Country</Label>
                        <Input aria-invalid={!!errors.shipping?.country} {...register("shipping.country")} />
                      </div>
                    )}
                    <div>
                      <Label className="mb-1.5">City</Label>
                      <Input aria-invalid={!!errors.shipping?.city} {...register("shipping.city")} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="mb-1.5">Street Address</Label>
                      <Input
                        aria-invalid={!!errors.shipping?.streetAddress}
                        {...register("shipping.streetAddress")}
                      />
                    </div>
                    {!isGhana && (
                      <div>
                        <Label className="mb-1.5">Postal Code</Label>
                        <Input {...register("shipping.postalCode")} />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <Label className="mb-1.5">Landmark (optional)</Label>
                      <Input {...register("shipping.landmark")} />
                    </div>
                    {errors.shipping?.recipientName && (
                      <p className="text-xs text-destructive sm:col-span-2">
                        {errors.shipping.recipientName.message}
                      </p>
                    )}
                    {user && isGhana && (
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

              <div className="flex justify-end">
                <Button type="button" disabled={isNavigating} onClick={goToNextStep}>
                  {isNavigating && <Loader2 className="size-4 animate-spin" />}
                  Continue to Delivery
                </Button>
              </div>
            </>
          )}

          {step === "delivery" && (
            <>
              <section>
                <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">
                  Delivery Method
                </h2>
                {isGhana ? (
                  <>
                    <DeliveryMethodSelect
                      value={deliveryMethod === "international" ? null : (deliveryMethod ?? null)}
                      onChange={(method) => setValue("deliveryMethod", method, { shouldValidate: true })}
                    />
                    {errors.deliveryMethod && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.deliveryMethod.message}</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                    International Shipping — <span className="text-foreground">{formatFromUsd(FLAT_INTERNATIONAL_DELIVERY_FEE_USD)}</span> flat rate, delivered worldwide.
                  </div>
                )}
              </section>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goToPreviousStep}>
                  Back
                </Button>
                <Button type="button" disabled={isNavigating} onClick={goToNextStep}>
                  {isNavigating && <Loader2 className="size-4 animate-spin" />}
                  Continue to Payment
                </Button>
              </div>
            </>
          )}

          {step === "payment" && (
            <>
              <section>
                <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">
                  Payment Method
                </h2>
                {isGhana ? (
                  <>
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
                      <GhPhoneInput aria-invalid={!!errors.payerPhone} {...register("payerPhone")} />
                      {errors.payerPhone && (
                        <p className="mt-1.5 text-xs text-destructive">{errors.payerPhone.message}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                    Pay securely by card — you&apos;ll be redirected to complete payment, then brought back here.
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">
                  Order Notes (optional)
                </h2>
                <Textarea rows={3} {...register("notes")} />
              </section>

              <div className="flex justify-start">
                <Button type="button" variant="outline" onClick={goToPreviousStep}>
                  Back
                </Button>
              </div>
            </>
          )}
        </div>

        {sidebar}
      </form>
    </div>
  );
}
