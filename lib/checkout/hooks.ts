"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { createClient } from "@/lib/supabase/client";

import { getCouponPreview } from "./queries";
import { lookupOrderStatus } from "./actions";

export function useCouponPreview(code: string, subtotal: number) {
  const supabase = useMemo(() => createClient(), []);
  const trimmed = code.trim();

  return useQuery({
    queryKey: ["coupon-preview", trimmed, subtotal],
    queryFn: () => getCouponPreview(supabase, trimmed, subtotal),
    enabled: trimmed.length > 0,
    retry: false,
  });
}

const TERMINAL_STATUSES = new Set(["paid", "cancelled", "refunded", "delivered"]);

export function useOrderStatus(orderNumber: string, contact: string) {
  return useQuery({
    queryKey: ["order-status", orderNumber, contact],
    queryFn: () => lookupOrderStatus(orderNumber, contact),
    enabled: !!orderNumber && !!contact,
    refetchInterval: (query) => {
      const result = query.state.data;
      if (result && "error" in result) return false;
      if (result?.order && TERMINAL_STATUSES.has(result.order.status)) return false;
      if (result?.order?.payment?.status === "failed") return false;
      return 4000;
    },
  });
}
