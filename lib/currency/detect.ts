import { headers } from "next/headers";

import { getCurrencyForCountry } from "./config";

/**
 * Vercel automatically populates x-vercel-ip-country in production. Falls
 * back to Ghana (the primary market) when absent — local dev has no Vercel
 * geo header, matching this project's "safe default until the real thing
 * exists" pattern used for Supabase/Moolre placeholders.
 */
export async function detectCountry(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-vercel-ip-country") ?? "GH";
}

/** Convenience for listing queries that need to exclude "International Only" products from the Ghana market. */
export async function isGhanaVisitor(): Promise<boolean> {
  return getCurrencyForCountry(await detectCountry()) === "GHS";
}
