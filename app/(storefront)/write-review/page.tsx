import type { Metadata } from "next";

import { WriteReviewFlow } from "@/components/shop/write-review-flow";

export const metadata: Metadata = {
  title: "Write a Review",
  description: "Share your experience with a KYSneakers product.",
};

export default function WriteReviewPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-heading text-3xl tracking-wide text-foreground">Write a Review</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Find the product you bought and share what you thought — your review goes live once our team
        approves it.
      </p>
      <WriteReviewFlow />
    </div>
  );
}
