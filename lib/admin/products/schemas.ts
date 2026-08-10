import { z } from "zod";

export const productSizeInputSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().min(1, "Enter a size"),
  quantity: z.number().int().min(0, "Stock can't be negative"),
  lowStockThreshold: z.number().int().min(0),
});

export const productFormSchema = z
  .object({
    sku: z.string().min(1, "Enter a SKU"),
    name: z.string().min(2, "Enter a product name"),
    slug: z
      .string()
      .min(2, "Enter a URL slug")
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
    description: z.string().optional(),
    /** "" means no brand/category selected — converted to null before insert. */
    brandId: z.string(),
    categoryId: z.string(),
    regularPrice: z.number().positive("Enter a price greater than 0"),
    isOnSale: z.boolean(),
    salePrice: z.number().positive().optional(),
    weightGrams: z.number().int().positive().optional(),
    /** Raw comma-separated input — split into an array right before insert. */
    tags: z.string().optional(),
    isFeatured: z.boolean(),
    isNewArrival: z.boolean(),
    status: z.enum(["draft", "active", "archived"]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    sizes: z.array(productSizeInputSchema).min(1, "Add at least one size"),
  })
  .refine((v) => !v.isOnSale || v.salePrice !== undefined, {
    message: "Enter a sale price",
    path: ["salePrice"],
  })
  .refine((v) => !v.isOnSale || v.salePrice === undefined || v.salePrice < v.regularPrice, {
    message: "Sale price must be less than the regular price",
    path: ["salePrice"],
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
