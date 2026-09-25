"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth/auth-context";
import { submitReview } from "@/lib/reviews/actions";
import { useInvalidateMyReview, useMyReview } from "@/lib/reviews/hooks";
import { buildReviewSchema, type ReviewValues } from "@/lib/reviews/schemas";
import { cn } from "@/lib/utils";

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const active = (hovered ?? value) >= starValue;
        return (
          <button
            key={starValue}
            type="button"
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(starValue)}
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                active ? "fill-secondary text-secondary" : "text-border"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ReviewForm({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const { user } = useAuth();
  const { data: myReview, isLoading } = useMyReview(productId, user?.id ?? null);
  const invalidateMyReview = useInvalidateMyReview();

  const schema = useMemo(() => buildReviewSchema(!user), [user]);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, body: "", guestName: "", guestEmail: "" },
  });
  const rating = useWatch({ control, name: "rating" });

  async function onSubmit(values: ReviewValues) {
    const result = await submitReview(productId, productSlug, values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Review submitted — pending moderation");
    if (user) {
      invalidateMyReview(productId, user.id);
    } else {
      reset({ rating: 0, title: "", body: "", guestName: "", guestEmail: "" });
    }
  }

  // Signed-in users get a "you already reviewed this" check via RLS; guests
  // have no session to scope that lookup to, so they always see the form —
  // acceptable since there's no way to reliably recognize a returning guest.
  if (user && isLoading) return null;

  if (user && myReview) {
    return (
      <Card>
        <CardContent className="space-y-2 py-6">
          <p className="text-sm font-semibold text-foreground">Your review</p>
          {myReview.status === "pending" && (
            <p className="text-xs text-muted-foreground">
              Pending moderation — not visible to other customers yet.
            </p>
          )}
          {myReview.status === "rejected" && (
            <p className="text-xs text-destructive">This review was not approved.</p>
          )}
          {myReview.title && (
            <p className="text-sm font-medium text-foreground">{myReview.title}</p>
          )}
          <p className="text-sm text-muted-foreground">{myReview.body}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Your rating</p>
            <StarRatingInput
              value={rating}
              onChange={(value) => setValue("rating", value, { shouldValidate: true })}
            />
            {errors.rating && (
              <p className="mt-1.5 text-xs text-destructive">{errors.rating.message}</p>
            )}
          </div>

          {!user && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input placeholder="Your name" aria-label="Your name" {...register("guestName")} />
                {errors.guestName && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.guestName.message}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your email"
                  aria-label="Your email"
                  {...register("guestEmail")}
                />
                {errors.guestEmail && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.guestEmail.message}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <Input placeholder="Title (optional)" aria-label="Review title" {...register("title")} />
            {errors.title && (
              <p className="mt-1.5 text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Textarea
              placeholder="Share your thoughts about this product..."
              aria-label="Review body"
              rows={4}
              {...register("body")}
            />
            {errors.body && <p className="mt-1.5 text-xs text-destructive">{errors.body.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="self-start">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
