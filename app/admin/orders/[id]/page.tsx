import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusForm } from "@/components/admin/orders/order-status-form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAdminOrderById } from "@/lib/admin/orders/queries";
import { formatCurrency } from "@/lib/currency/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const order = await getAdminOrderById(supabase, id);
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-foreground">{order.orderNumber}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString("en-GH")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mb-6 rounded-xl border border-border p-6">
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Customer</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-foreground">{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{order.customerEmail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="text-foreground">{order.customerPhone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Account</dt>
              <dd className="text-foreground">{order.profileId ? "Registered" : "Guest"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Shipping Address</h2>
          <p className="text-sm text-foreground">{order.shippingRecipientName}</p>
          <p className="text-sm text-muted-foreground">{order.shippingPhone}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.shippingStreetAddress}, {order.shippingCity},{" "}
            {order.shippingRegion ?? order.shippingCountry}
            {order.shippingPostalCode ? ` ${order.shippingPostalCode}` : ""}
          </p>
          {order.shippingLandmark && (
            <p className="text-sm text-muted-foreground">Landmark: {order.shippingLandmark}</p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border p-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Items</h2>
        <div className="space-y-2 text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-muted-foreground">
              <span>
                {item.productName} ({item.sku}) · {item.size} × {item.quantity}
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
          {order.vatRate > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Includes VAT ({Math.round(order.vatRate * 100)}%)</span>
              <span>{formatCurrency(order.vatAmount, order.currency)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border p-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Payment History <span className="font-normal text-muted-foreground">(read-only — set by webhook)</span>
        </h2>
        {order.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payment attempts yet.</p>
        ) : (
          <div className="space-y-3">
            {order.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-foreground">
                    {payment.method.replace(/_/g, " ")}
                    {payment.payerPhone ? ` · ${payment.payerPhone}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.providerReference ?? "no reference"}
                    {payment.providerMessage ? ` · ${payment.providerMessage}` : ""}
                  </p>
                </div>
                <Badge
                  variant={
                    payment.status === "successful"
                      ? "secondary"
                      : payment.status === "failed"
                        ? "destructive"
                        : "default"
                  }
                >
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {order.notes && (
        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Notes</h2>
          <p className="text-sm text-muted-foreground">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
