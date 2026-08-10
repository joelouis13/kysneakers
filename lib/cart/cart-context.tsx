"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useLocalStorageState } from "@/lib/hooks/use-local-storage";

export type CartItem = {
  productSlug: string;
  size: string;
  quantity: number;
  savedForLater: boolean;
};

type CartState = {
  items: CartItem[];
  couponCode: string | null;
};

type CartContextValue = {
  items: CartItem[];
  activeItems: CartItem[];
  savedItems: CartItem[];
  couponCode: string | null;
  itemCount: number;
  addItem: (productSlug: string, size: string, quantity?: number) => void;
  updateQuantity: (productSlug: string, size: string, quantity: number) => void;
  removeItem: (productSlug: string, size: string) => void;
  toggleSavedForLater: (productSlug: string, size: string) => void;
  /** Persists an already-validated code — validation itself happens via getCouponPreview. */
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clearCart: () => void;
};

const EMPTY_CART_STATE: CartState = { items: [], couponCode: null };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorageState<CartState>("kysneakers:cart", EMPTY_CART_STATE);

  const addItem = useCallback(
    (productSlug: string, size: string, quantity = 1) => {
      setState((prev) => {
        const existing = prev.items.find(
          (i) => i.productSlug === productSlug && i.size === size && !i.savedForLater
        );
        const items = existing
          ? prev.items.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + quantity } : i
            )
          : [...prev.items, { productSlug, size, quantity, savedForLater: false }];
        return { ...prev, items };
      });
    },
    [setState]
  );

  const updateQuantity = useCallback(
    (productSlug: string, size: string, quantity: number) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.productSlug === productSlug && i.size === size
            ? { ...i, quantity: Math.max(1, quantity) }
            : i
        ),
      }));
    },
    [setState]
  );

  const removeItem = useCallback(
    (productSlug: string, size: string) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((i) => !(i.productSlug === productSlug && i.size === size)),
      }));
    },
    [setState]
  );

  const toggleSavedForLater = useCallback(
    (productSlug: string, size: string) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.productSlug === productSlug && i.size === size
            ? { ...i, savedForLater: !i.savedForLater }
            : i
        ),
      }));
    },
    [setState]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      setState((prev) => ({ ...prev, couponCode: code }));
    },
    [setState]
  );

  const removeCoupon = useCallback(() => {
    setState((prev) => ({ ...prev, couponCode: null }));
  }, [setState]);

  const clearCart = useCallback(() => {
    setState(EMPTY_CART_STATE);
  }, [setState]);

  const value = useMemo<CartContextValue>(() => {
    const activeItems = state.items.filter((i) => !i.savedForLater);
    const savedItems = state.items.filter((i) => i.savedForLater);
    return {
      items: state.items,
      activeItems,
      savedItems,
      couponCode: state.couponCode,
      itemCount: activeItems.reduce((sum, i) => sum + i.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      toggleSavedForLater,
      applyCoupon,
      removeCoupon,
      clearCart,
    };
  }, [
    state,
    addItem,
    updateQuantity,
    removeItem,
    toggleSavedForLater,
    applyCoupon,
    removeCoupon,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
