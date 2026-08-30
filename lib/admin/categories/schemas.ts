import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Enter a category name"),
  slug: z
    .string()
    .min(2, "Enter a URL slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
  /** Local /products path or an external URL — shown on the /categories grid. */
  imageUrl: z.string().optional(),
  displayOrder: z.number().int(),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
