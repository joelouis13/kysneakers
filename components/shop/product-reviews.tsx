import { Star } from "lucide-react";

import { ReviewForm } from "@/components/shop/review-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getApprovedReviews, getAverageRating } from "@/lib/reviews/queries";
import { createClient } from "@/lib/supabase/server";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={
            i < Math.round(rating) ? "size-4 fill-secondary text-secondary" : "size-4 text-border"
          }
        />
      ))}
    </div>
  );
}

export async function ProductReviews({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const supabase = await createClient();
  const reviews = await getApprovedReviews(supabase, productId);
  const average = getAverageRating(reviews);

  return (
    <section className="border-t border-border py-12">
      <div className="mb-8">
        <h2 className="font-heading text-2xl tracking-wide text-foreground">Customer Reviews</h2>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={average} />
          <span className="text-sm text-muted-foreground">
            {reviews.length > 0
              ? `${average.toFixed(1)} out of 5 (${reviews.length} ${reviews.length === 1 ? "review" : "reviews"})`
              : "No reviews yet"}
          </span>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border p-5">
              <div className="flex items-center justify-between">
                <Stars rating={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("en-GH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {review.title && (
                <h3 className="mt-3 text-sm font-semibold text-foreground">{review.title}</h3>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
              <div className="mt-4 flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                    {initials(review.reviewerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <span className="font-medium text-foreground">{review.reviewerName}</span>
                  {review.verifiedPurchase && (
                    <span className="ml-1 text-muted-foreground">· Verified Purchase</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReviewForm productId={productId} productSlug={productSlug} />
    </section>
  );
}
