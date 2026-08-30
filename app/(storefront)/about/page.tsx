import type { Metadata } from "next";

import { RESELLER_DISCLAIMER } from "@/lib/data/disclaimer";

export const metadata: Metadata = {
  title: "About Us",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl tracking-wide text-foreground sm:text-4xl">About Us</h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          KYSneakers is a Ghana-based retailer offering sneakers, perfumes, suits, t-shirts, and bags,
          with delivery across Ghana and shipping to the Netherlands and the rest of Europe.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground">Trademarks &amp; Brand Names</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{RESELLER_DISCLAIMER}</p>
      </div>
    </div>
  );
}
