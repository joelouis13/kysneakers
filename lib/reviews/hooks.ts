"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { createClient } from "@/lib/supabase/client";

import { getMyReview } from "./queries";

export function useMyReview(productId: string, profileId: string | null) {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: ["reviews", "mine", productId, profileId],
    queryFn: () => getMyReview(supabase, productId, profileId!),
    enabled: !!profileId,
  });
}

export function useInvalidateMyReview() {
  const queryClient = useQueryClient();
  return (productId: string, profileId: string) =>
    queryClient.invalidateQueries({ queryKey: ["reviews", "mine", productId, profileId] });
}
