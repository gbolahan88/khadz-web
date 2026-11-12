// context/cart-context.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: string | number;
  image: string;
  quantity: number;
  category?: string;
  rating?: number;
  availabilityStatus?: string;
  description?: string | null;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("khadz-cart");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("khadz-cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cart]);

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────

  const addToCart = useCallback((burger: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === burger.id);
      if (existing) {
        return prev.map((item) =>
          item.id === burger.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      const newItem: CartItem = { ...burger, quantity: 1 };
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const increaseQty = useCallback((id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const decreaseQty = useCallback((id: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getTotalItems = useCallback(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const getTotalPrice = useCallback(
    () =>
      cart.reduce((total, item) => {
        const price =
          typeof item.price === "number"
            ? item.price
            : Number(item.price.toString().replace(/[^0-9.-]/g, "")) || 0;
        return total + price * item.quantity;
      }, 0),
    [cart],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider");
  return ctx;
}