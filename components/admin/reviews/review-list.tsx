"use client";

import { Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteReview, updateReviewStatus } from "@/lib/admin/reviews/actions";
import type { AdminReviewListItem } from "@/lib/admin/reviews/types";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < rating ? "size-3.5 fill-secondary text-secondary" : "size-3.5 text-border"}
        />
      ))}
    </div>
  );
}

function ReviewRow({ review }: { review: AdminReviewListItem }) {
  const [isActing, setIsActing] = useState<"approve" | "reject" | "delete" | null>(null);

  async function handleStatus(status: "approved" | "rejected") {
    setIsActing(status === "approved" ? "approve" : "reject");
    const result = await updateReviewStatus(review.id, status);
    setIsActing(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(status === "approved" ? "Review approved" : "Review rejected");
  }

  async function handleDelete() {
    setIsActing("delete");
    const result = await deleteReview(review.id);
    setIsActing(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Review deleted");
  }

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/product/${review.productSlug}`}
            target="_blank"
            className="text-sm font-semibold text-foreground hover:underline"
          >
            {review.productName}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Stars rating={review.rating} />
            <span>
              {review.reviewerName}
              {review.isGuest ? " (Guest)" : ""}
              {review.reviewerEmail ? ` · ${review.reviewerEmail}` : ""}
            </span>
          </div>
        </div>
        <Badge
          variant={
            review.status === "approved" ? "secondary" : review.status === "rejected" ? "destructive" : "default"
          }
        >
          {review.status}
        </Badge>
      </div>

      {review.title && <p className="mt-3 text-sm font-medium text-foreground">{review.title}</p>}
      {review.body && <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>}

      <div className="mt-4 flex items-center gap-2">
        {review.status !== "approved" && (
          <Button size="sm" disabled={!!isActing} onClick={() => handleStatus("approved")}>
            {isActing === "approve" && <Loader2 className="size-4 animate-spin" />}
            Approve
          </Button>
        )}
        {review.status !== "rejected" && (
          <Button size="sm" variant="outline" disabled={!!isActing} onClick={() => handleStatus("rejected")}>
            {isActing === "reject" && <Loader2 className="size-4 animate-spin" />}
            Reject
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-destructive" disabled={!!isActing} onClick={handleDelete}>
          {isActing === "delete" && <Loader2 className="size-4 animate-spin" />}
          Delete
        </Button>
      </div>
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: AdminReviewListItem[] }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No reviews here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewRow key={review.id} review={review} />
      ))}
    </div>
  );
}
