import type { Metadata } from "next";

import { OrderLookupForm } from "@/components/orders/order-lookup-form";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track the status of your KYSneakers order.",
};

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-heading text-3xl tracking-wide text-foreground">Track Order</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Enter your order number and the email or phone number used at checkout.
      </p>
      <OrderLookupForm />
    </div>
  );
}
