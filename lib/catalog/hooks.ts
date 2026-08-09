"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { createClient } from "@/lib/supabase/client";

import { getCatalogFacets, getProductsBySlugs } from "./queries";

export function useProductsBySlugs(slugs: string[]) {
  const supabase = useMemo(() => createClient(), []);
  const sortedSlugs = [...slugs].sort();

  return useQuery({
    queryKey: ["products", "by-slugs", sortedSlugs],
    queryFn: () => getProductsBySlugs(supabase, sortedSlugs),
    enabled: sortedSlugs.length > 0,
  });
}

export function useCatalogFacets() {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: ["catalog-facets"],
    queryFn: () => getCatalogFacets(supabase),
    staleTime: 5 * 60 * 1000,
  });
}
