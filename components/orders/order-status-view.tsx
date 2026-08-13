"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart/cart-context";
import { retryPayment, submitPaymentOtp } from "@/lib/checkout/actions";
import { useOrderStatus } from "@/lib/checkout/hooks";
import type { OrderStatusPayload } from "@/lib/checkout/types";
import { formatCurrency } from "@/lib/currency/format";

const ORDER_STATUS_LABELS: Record<OrderStatusPayload["status"], string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  ready_for_dispatch: "Ready for Dispatch",
  dispatched: "Dispatched",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function OrderStatusView({ initialOrder }: { initialOrder: OrderStatusPayload }) {
  const queryClient = useQueryClient();
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  const { data } = useOrderStatus(initialOrder.orderNumber, initialOrder.customerEmail);
  const order = (data && "order" in data ? data.order : null) ?? initialOrder;

  const [otp, setOtp] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [isActing, setIsActing] = useState(false);

  const payment = order.payment;
  const needsOtp = payment?.status === "pending" && payment.providerMessage === "TP14";
  const isPending = payment?.status === "pending" && !needsOtp;
  const isFailed = payment?.status === "failed";
  const isPaid = order.status === "paid" || payment?.status === "successful";

  useEffect(() => {
    if (!clearedRef.current && isPaid) {
      clearCart();
      clearedRef.current = true;
    }
  }, [isPaid, clearCart]);

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: ["order-status", order.orderNumber, order.customerEmail],
    });
  }

  async function handleOtpSubmit() {
    if (!payment || !otp.trim()) return;
    setIsActing(true);
    const result = await submitPaymentOtp(payment.id, otp.trim());
    setIsActing(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setOtp("");
    invalidate();
  }

  async function handleRetry() {
    if (!payment) return;
    setIsActing(true);
    const result = await retryPayment(payment.id, payerPhone.trim() || undefined);
    setIsActing(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    invalidate();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Order
            </p>
            <p className="font-heading text-2xl tracking-wide text-foreground">
              {order.orderNumber}
            </p>
          </div>
          <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-muted-foreground">
              <span>
                {item.productName} · {item.size} × {item.quantity}
              </span>
              <span className="text-foreground">{formatCurrency(item.lineTotal, order.currency)}</span>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground">{formatCurrency(order.subtotal, order.currency)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Discount</span>
              <span className="text-secondary">-{formatCurrency(order.discountTotal, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span className="text-foreground">{formatCurrency(order.deliveryFee, order.currency)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(order.total, order.currency)}</span>
          </div>
        </div>
      </div>

      {isPaid && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-accent p-4">
          <CheckCircle2 className="size-6 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Payment confirmed</p>
            <p className="text-xs text-muted-foreground">
              We&apos;ll notify you as your order progresses.
            </p>
          </div>
        </div>
      )}

      {needsOtp && (
        <div className="rounded-xl border border-border p-6">
          <p className="text-sm font-semibold text-foreground">Enter the code sent to your phone</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your mobile money provider sent a one-time code to approve this payment.
          </p>
          <div className="mt-3 flex gap-2">
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP code" />
            <Button onClick={handleOtpSubmit} disabled={isActing || !otp.trim()}>
              Confirm
            </Button>
          </div>
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-3 rounded-xl border border-border p-4">
          <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Waiting for you to approve the payment prompt on your phone...
          </p>
        </div>
      )}

      {isFailed && (
        <div className="rounded-xl border border-destructive/30 p-6">
          <div className="flex items-center gap-2">
            <XCircle className="size-5 shrink-0 text-destructive" />
            <p className="text-sm font-semibold text-foreground">Payment failed</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Double-check your mobile money number and try again.
          </p>
          <div className="mt-3 flex gap-2">
            <Input
              value={payerPhone}
              onChange={(e) => setPayerPhone(e.target.value)}
              placeholder="Mobile money number (optional)"
            />
            <Button onClick={handleRetry} disabled={isActing}>
              Retry Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
