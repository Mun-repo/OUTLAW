import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, PromoCode } from "@/lib/types";

type CartState = {
  items: CartItem[];
  promo: PromoCode | null;
  add: (product: Product) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  setPromo: (promo: PromoCode | null) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      add: (product) => {
        const existing = get().items.find((item) => item.productId === product.id);
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              productId: product.id,
              title: product.title,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity: 1,
            },
          ],
        });
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((item) => item.productId !== productId) });
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        });
      },
      remove: (productId) =>
        set({ items: get().items.filter((item) => item.productId !== productId) }),
      setPromo: (promo) => set({ promo }),
      clear: () => set({ items: [], promo: null }),
    }),
    { name: "outlaw-cart" },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function applyPromo(subtotal: number, promo: PromoCode | null) {
  if (!promo || !promo.active) return { total: subtotal, discount: 0 };
  if (promo.kind === "percent") {
    const discount = Math.min(subtotal, (subtotal * promo.value) / 100);
    return { total: Math.max(0, subtotal - discount), discount };
  }
  if (promo.kind === "fixed") {
    const discount = Math.min(subtotal, promo.value);
    return { total: Math.max(0, subtotal - discount), discount };
  }
  return { total: subtotal, discount: 0 };
}

export function cartTotal(items: CartItem[], promo: PromoCode | null = null) {
  return applyPromo(cartSubtotal(items), promo).total;
}
