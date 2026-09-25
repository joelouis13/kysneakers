import { z } from "zod";

/**
 * A schema factory, not a static schema: guest name/email are only required
 * when the submitter isn't logged in — sign-ups are currently closed, so
 * most reviewers won't have an account at all.
 */
export function buildReviewSchema(requireGuestInfo: boolean) {
  return z.object({
    rating: z.number().min(1, "Select a rating").max(5),
    title: z.string().max(120, "Keep it under 120 characters").optional(),
    body: z
      .string()
      .min(10, "Tell us a bit more (at least 10 characters)")
      .max(2000, "Keep it under 2000 characters"),
    guestName: requireGuestInfo
      ? z.string().min(2, "Enter your name")
      : z.string().optional(),
    guestEmail: requireGuestInfo
      ? z.string().email("Enter a valid email address")
      : z.string().optional(),
  });
}

export type ReviewValues = z.infer<ReturnType<typeof buildReviewSchema>>;
