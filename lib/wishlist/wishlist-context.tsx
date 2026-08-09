"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useLocalStorageState } from "@/lib/hooks/use-local-storage";

type WishlistContextValue = {
  slugs: string[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const EMPTY_WISHLIST: string[] = [];

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useLocalStorageState<string[]>(
    "kysneakers:wishlist",
    EMPTY_WISHLIST
  );

  const toggle = useCallback(
    (slug: string) => {
      setSlugs((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      );
    },
    [setSlugs]
  );

  const remove = useCallback(
    (slug: string) => {
      setSlugs((prev) => prev.filter((s) => s !== slug));
    },
    [setSlugs]
  );

  const clear = useCallback(() => setSlugs(EMPTY_WISHLIST), [setSlugs]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      slugs,
      count: slugs.length,
      has: (slug: string) => slugs.includes(slug),
      toggle,
      remove,
      clear,
    }),
    [slugs, toggle, remove, clear]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
