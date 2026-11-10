// app/orders/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { useAuth } from "@/context/auth-context";
import { formatCurrency } from "@/lib/format";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  STATUS_STEP_INDEX,
  type OrderStatus,
} from "@/lib/order-status";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  priceAtPurchase: string;
};

type Order = {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

// ─────────────────────────────────────────────
// Inner component — uses useSearchParams
// ─────────────────────────────────────────────

function OrdersContent() {
  const searchParams = useSearchParams();
  const newOrderId = searchParams.get("new");
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    const load = async () => {
      try {
        const token = await user.getIdToken(true);
        const res = await fetch("/api/orders/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) setOrders(data.orders ?? []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setOrders([]);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const isLoading = authLoading || (!!user && orders === null);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
          <div className="animate-pulse rounded-2xl bg-white p-6 text-sm text-neutral-500 shadow-sm">Loading your orders...</div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
          <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">📦</span>
          <h1 className="text-2xl font-extrabold text-neutral-900">Your orders are one sign-in away</h1>
          <p className="mb-6 mt-2 text-sm text-neutral-500">Log in to view your order history and delivery updates.</p>
          <Link
            href="/login?redirect=/orders"
            className="inline-flex rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Log in
          </Link>
        </main>
      </>
    );
  }

  const list = orders ?? [];

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">The good stuff</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Your orders</h1>
          <p className="mt-2 text-sm text-neutral-500">Check the status and details of your orders.</p>
        </div>

        {newOrderId && (
          <div role="status" className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            ✅ Order placed successfully! Order ID:{" "}
            <code>{newOrderId.slice(0, 8)}</code>
          </div>
        )}

        {list.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">🍔</span>
            <h2 className="text-xl font-extrabold text-neutral-900">Your first order is waiting</h2>
            <p className="mb-6 mt-2 text-sm text-neutral-500">Your orders will show up here once you find a favorite.</p>
            <Link
              href="/"
              className="inline-flex rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
              >
                {/* Header row */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-neutral-500">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      STATUS_BADGE_CLASSES[order.status as OrderStatus] ??
                      "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                  </span>
                </div>

                {/* Timeline */}
                {order.status !== "cancelled" && (
                  <div className="my-5">
                    <div className="flex items-center">
                      {["pending", "preparing", "on_the_way", "delivered"].map(
                        (step, i) => {
                          const currentIndex =
                            STATUS_STEP_INDEX[order.status as OrderStatus] ?? 0;
                          const isDone = i <= currentIndex;
                          const isCurrent = i === currentIndex;

                          return (
                            <div
                              key={step}
                              className="flex items-center flex-1 last:flex-none"
                            >
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                    isDone
                                      ? "bg-orange-500 text-white"
                                      : "bg-neutral-200 text-neutral-500"
                                  } ${isCurrent ? "ring-4 ring-orange-100" : ""}`}
                                >
                                  {isDone ? "✓" : i + 1}
                                </div>
                                <span className="text-[10px] mt-1 text-neutral-600 text-center whitespace-nowrap">
                                  {STATUS_LABELS[step as OrderStatus]}
                                </span>
                              </div>
                              {i < 3 && (
                                <div
                                  className={`flex-1 h-0.5 mx-1 ${
                                    i < currentIndex
                                      ? "bg-orange-500"
                                      : "bg-neutral-200"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

                <ul className="text-sm space-y-1 mb-3">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity} × {item.name}
                      </span>
                      <span className="text-neutral-600">
                        {formatCurrency(item.priceAtPurchase)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between border-t border-neutral-200 pt-3 font-extrabold text-neutral-900">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// ─────────────────────────────────────────────
// Default export — wraps content in Suspense
// ─────────────────────────────────────────────

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
            <div className="animate-pulse rounded-2xl bg-white p-6 text-sm text-neutral-500 shadow-sm">Loading your orders...</div>
          </main>
        </>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}