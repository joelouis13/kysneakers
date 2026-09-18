"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orderLookupSchema, type OrderLookupValues } from "@/lib/checkout/schemas";
import { lookupOrderStatus } from "@/lib/checkout/actions";
import type { OrderStatusPayload } from "@/lib/checkout/types";
import { OrderStatusView } from "@/components/orders/order-status-view";

export function OrderLookupForm() {
  // The order confirmation email links here with these pre-filled so
  // customers (almost all guests — sign-ups are closed) land straight on
  // their order instead of having to retype what the email already knows.
  const searchParams = useSearchParams();
  const prefilledOrderNumber = searchParams.get("orderNumber") ?? "";
  const prefilledContact = searchParams.get("contact") ?? "";
  const autoLookupRan = useRef(false);

  const [order, setOrder] = useState<OrderStatusPayload | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [isAutoLookingUp, setIsAutoLookingUp] = useState(!!prefilledOrderNumber && !!prefilledContact);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderLookupValues>({
    resolver: zodResolver(orderLookupSchema),
    defaultValues: { orderNumber: prefilledOrderNumber, contact: prefilledContact },
  });

  async function runLookup(values: OrderLookupValues) {
    setNotFound(null);
    const result = await lookupOrderStatus(values.orderNumber, values.contact);
    if ("error" in result) {
      setNotFound(result.error);
      return;
    }
    setOrder(result.order);
  }

  useEffect(() => {
    if (autoLookupRan.current || !prefilledOrderNumber || !prefilledContact) return;
    autoLookupRan.current = true;
    runLookup({ orderNumber: prefilledOrderNumber, contact: prefilledContact }).finally(() =>
      setIsAutoLookingUp(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAutoLookingUp) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Looking up your order...
      </div>
    );
  }

  if (order) {
    return <OrderStatusView initialOrder={order} />;
  }

  return (
    <form
      onSubmit={handleSubmit(runLookup)}
      noValidate
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <div>
        <Input
          placeholder="Order number (e.g. KYS-260810-A1B2C3)"
          aria-invalid={!!errors.orderNumber}
          {...register("orderNumber")}
        />
        {errors.orderNumber && (
          <p className="mt-1.5 text-xs text-destructive">{errors.orderNumber.message}</p>
        )}
      </div>
      <div>
        <Input
          placeholder="Email or phone used at checkout"
          aria-invalid={!!errors.contact}
          {...register("contact")}
        />
        {errors.contact && (
          <p className="mt-1.5 text-xs text-destructive">{errors.contact.message}</p>
        )}
      </div>
      {notFound && <p className="text-xs text-destructive">{notFound}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? "Searching..." : "Track Order"}
      </Button>
    </form>
  );
}
