import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().min(2, "Enter a brand name"),
  slug: z
    .string()
    .min(2, "Enter a URL slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
  /** Local /brands path or an external URL. */
  logoUrl: z.string().optional(),
  isActive: z.boolean(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
