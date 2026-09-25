import type { Metadata } from "next";

import { ReviewFilters } from "@/components/admin/reviews/review-filters";
import { ReviewList } from "@/components/admin/reviews/review-list";
import { listAdminReviews, type AdminReviewFilters } from "@/lib/admin/reviews/queries";
import { createClient } from "@/lib/supabase/server";
import type { ReviewStatus } from "@/lib/admin/reviews/types";

export const metadata: Metadata = {
  title: "Reviews",
};

type RawSearchParams = { [key: string]: string | string[] | undefined };

const STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  // No ?status param defaults to the moderation queue (pending) — the thing
  // staff actually need to act on — rather than "all", which buries it.
  const status =
    typeof sp.status === "string"
      ? STATUSES.includes(sp.status as ReviewStatus)
        ? (sp.status as ReviewStatus)
        : undefined
      : "pending";

  const filters: AdminReviewFilters = { status };
  const reviews = await listAdminReviews(supabase, filters);

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Reviews</h1>
      <ReviewFilters />
      <ReviewList reviews={reviews} />
    </div>
  );
}
