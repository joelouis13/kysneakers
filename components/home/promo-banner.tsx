import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-white/10 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-widest text-white/70">
          Limited Time
        </p>
        <h2 className="relative mt-3 font-heading text-3xl tracking-wide text-white sm:text-5xl">
          Up to 20% Off Select Styles
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm text-white/80 sm:text-base">
          Free delivery in Accra on orders over GHS 500. Sale ends soon.
        </p>
        <Button size="lg" variant="secondary" className="relative mt-6" asChild>
          <Link href="/shop?filter=on-sale">Shop the Sale</Link>
        </Button>
      </div>
    </section>
  );
}
