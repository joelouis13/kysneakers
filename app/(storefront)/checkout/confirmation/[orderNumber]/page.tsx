import type { Metadata } from "next";

import { ConfirmationView } from "@/components/checkout/confirmation-view";

export const metadata: Metadata = {
  title: "Order Confirmation",
};

export default async function CheckoutConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <ConfirmationView orderNumber={orderNumber} />
    </div>
  );
}
