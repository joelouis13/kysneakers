"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orderLookupSchema, type OrderLookupValues } from "@/lib/checkout/schemas";
import { lookupOrderStatus } from "@/lib/checkout/actions";
import type { OrderStatusPayload } from "@/lib/checkout/types";
import { OrderStatusView } from "@/components/orders/order-status-view";

export function OrderLookupForm() {
  const [order, setOrder] = useState<OrderStatusPayload | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderLookupValues>({
    resolver: zodResolver(orderLookupSchema),
  });

  async function onSubmit(values: OrderLookupValues) {
    setNotFound(null);
    const result = await lookupOrderStatus(values.orderNumber, values.contact);
    if ("error" in result) {
      setNotFound(result.error);
      return;
    }
    setOrder(result.order);
  }

  if (order) {
    return <OrderStatusView initialOrder={order} />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
