import { z } from "zod";

export const productSizeInputSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().min(1, "Enter a size"),
  quantity: z.number().int().min(0, "Stock can't be negative"),
  lowStockThreshold: z.number().int().min(0),
});

/**
 * A schema factory, not a static schema: whether `sizes` can be left empty
 * depends on the Perfumes category's id, which only the caller (client form
 * or server action) knows how to look up — a single-variant fragrance has no
 * meaningful size, unlike every other category where at least one size row
 * is required.
 */
export function buildProductFormSchema(sizeExemptCategoryId: string | null) {
  return z
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
      /** Optional — leaving blank means "auto-convert from EUR at the live rate" (the reverse of eurRegularPrice's fallback). At least one of the two must be set. */
      regularPrice: z.number().positive("Enter a price greater than 0").optional(),
      isOnSale: z.boolean(),
      salePrice: z.number().positive().optional(),
      /** Optional — leaving blank means "auto-convert from GHS at the live rate" on the storefront. */
      eurRegularPrice: z.number().positive("Enter a price greater than 0").optional(),
      eurSalePrice: z.number().positive().optional(),
      weightGrams: z.number().int().positive().optional(),
      /** Raw comma-separated input — split into an array right before insert. */
      tags: z.string().optional(),
      isFeatured: z.boolean(),
      isNewArrival: z.boolean(),
      isFlashSale: z.boolean(),
      isInternationalOnly: z.boolean(),
      isGhanaOnly: z.boolean(),
      status: z.enum(["draft", "active", "archived", "out_of_stock"]),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      sizes: z.array(productSizeInputSchema),
    })
    .refine((v) => v.regularPrice !== undefined || v.eurRegularPrice !== undefined, {
      message: "Enter a regular price (GHS or EUR)",
      path: ["regularPrice"],
    })
    .refine((v) => !v.isOnSale || v.regularPrice === undefined || v.salePrice !== undefined, {
      message: "Enter a sale price",
      path: ["salePrice"],
    })
    .refine(
      (v) =>
        !v.isOnSale || v.salePrice === undefined || v.regularPrice === undefined || v.salePrice < v.regularPrice,
      {
        message: "Sale price must be less than the regular price",
        path: ["salePrice"],
      }
    )
    .refine(
      (v) =>
        !v.isOnSale ||
        v.eurSalePrice === undefined ||
        v.eurRegularPrice === undefined ||
        v.eurSalePrice < v.eurRegularPrice,
      {
        message: "EUR sale price must be less than the EUR regular price",
        path: ["eurSalePrice"],
      }
    )
    .refine((v) => v.sizes.length > 0 || (!!v.categoryId && v.categoryId === sizeExemptCategoryId), {
      message: "Add at least one size",
      path: ["sizes"],
    })
    .refine((v) => !(v.isInternationalOnly && v.isGhanaOnly), {
      message: "A product can't be both International Only and Ghana Only",
      path: ["isGhanaOnly"],
    });
}

export type ProductFormValues = z.infer<ReturnType<typeof buildProductFormSchema>>;

export function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
