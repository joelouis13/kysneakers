import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Select a rating").max(5),
  title: z.string().max(120, "Keep it under 120 characters").optional(),
  body: z
    .string()
    .min(10, "Tell us a bit more (at least 10 characters)")
    .max(2000, "Keep it under 2000 characters"),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
