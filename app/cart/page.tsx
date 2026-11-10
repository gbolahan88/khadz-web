// app/cart/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    getTotalPrice,
  } = useCart();

  const subtotal = getTotalPrice();
  const deliveryFee = cart.length > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Almost yours</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Your cart</h1>
          <p className="mt-2 text-sm text-neutral-500">Take one last look at your order.</p>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">🛍️</span>
            <h2 className="text-xl font-extrabold text-neutral-900">Your cart is waiting for something tasty</h2>
            <p className="mb-6 mt-2 text-sm text-neutral-500">Browse the menu and add a favorite.</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600"
            >
              Browse burgers
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Items list */}
            <div className="md:col-span-2 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-bold text-neutral-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-2">
                      {formatCurrency(item.price)} each
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50">
                        <button
                          onClick={() => decreaseQty(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-l-xl text-neutral-600 transition hover:bg-orange-50 hover:text-orange-700"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQty(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-r-xl text-neutral-600 transition hover:bg-orange-50 hover:text-orange-700"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-sm font-bold text-neutral-900">
                    {formatCurrency(
                      (typeof item.price === "number"
                        ? item.price
                        : Number(
                            item.price
                              .toString()
                              .replace(/[^0-9.-]/g, ""),
                          )) * item.quantity,
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="md:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-5 text-lg font-extrabold text-neutral-900">Order summary</h2>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Delivery</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-extrabold text-neutral-900">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/25"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}