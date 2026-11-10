// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, getTotalPrice, clearCart } = useCart();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = getTotalPrice();
  const deliveryFee = cart.length > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  // Redirect logged-out users to /login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, user, router]);

  // Redirect empty-cart users to /
  useEffect(() => {
    if (!authLoading && cart.length === 0) {
      router.push("/");
    }
  }, [authLoading, cart.length, router]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);

    try {
      const token = await user.getIdToken(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          address,
          phone,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create order");
        setSubmitting(false);
        return;
      }

      if (data.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.authorizationUrl;
        return;
      } else {
        clearCart();
        router.push(`/orders?new=${data.orderId}`);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  if (authLoading || !user || cart.length === 0) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
          <div className="animate-pulse rounded-2xl bg-white p-6 text-sm text-neutral-500 shadow-sm">Preparing your checkout...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Final step</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Checkout</h1>
          <p className="mt-2 text-sm text-neutral-500">Where should we bring your order?</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid gap-6 md:grid-cols-3">
          {/* Form */}
          <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7 md:col-span-2">
            <div>
              <label htmlFor="delivery-address" className="mb-2 block text-sm font-semibold text-neutral-800">
                Delivery address
              </label>
              <textarea
                id="delivery-address"
                aria-label="Delivery address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="12 Adeola Street, Oke-baale, Osogbo, Osun State"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div>
              <label htmlFor="delivery-phone" className="mb-2 block text-sm font-semibold text-neutral-800">
                Phone number
              </label>
              <input
                id="delivery-phone"
                type="tel"
                aria-label="Phone number"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div>
              <label htmlFor="delivery-notes" className="mb-2 block text-sm font-semibold text-neutral-800">
                Notes (optional)
              </label>
              <textarea
                id="delivery-notes"
                aria-label="Notes (optional)"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Extra ketchup, no onions..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-lg font-extrabold text-neutral-900">Order summary</h2>

              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-neutral-500">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Delivery</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between pt-2 text-base font-extrabold text-neutral-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 h-12 w-full rounded-xl bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Placing order..." : `Place order · ${formatCurrency(total)}`}
              </button>

              <Link
                href="/cart"
                className="mt-4 block rounded-lg py-2 text-center text-sm font-semibold text-neutral-500 transition hover:text-orange-600"
              >
                ← Back to cart
              </Link>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}