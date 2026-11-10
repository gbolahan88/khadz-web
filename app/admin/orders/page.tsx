// app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useAuth } from "@/context/auth-context";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import {
  ORDER_STATUSES,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-status";

type AdminOrder = {
  id: string;
  total: string;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress: string | null;
  deliveryPhone: string | null;
  notes: string | null;
  userId: string;
  customerName: string | null;
  customerEmail: string;
  riderId: string | null;
  riderName: string | null;
  riderPhone: string | null;
};

type Rider = {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
};

export default function AdminOrdersPage() {
  const { user, isAdmin, loading, roleLoading } = useAuth();

  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || roleLoading) return;
    if (!user || !isAdmin) return;

    let cancelled = false;

    const load = async () => {
      try {
        const token = await user.getIdToken(true);
        const [ordersRes, ridersRes] = await Promise.all([
          fetch("/api/admin/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/admin/riders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const ordersData = await ordersRes.json();
        const ridersData = await ridersRes.json();

        if (!cancelled) {
          setOrders(ordersData.orders ?? []);
          setRiders(ridersData.riders ?? []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setOrders([]);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, loading, roleLoading]);

  const patchOrder = async (
    orderId: string,
    body: { status?: OrderStatus; riderId?: string | null },
  ) => {
    if (!user) return;
    setUpdating(orderId);
    setError("");

    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Update failed");
        return;
      }

      setOrders((prev) =>
        prev
          ? prev.map((o) => {
              if (o.id !== orderId) return o;
              const next = { ...o };
              if (body.status !== undefined) next.status = body.status;
              if (body.riderId !== undefined) {
                next.riderId = body.riderId;
                const rider = riders.find((r) => r.id === body.riderId);
                next.riderName = rider?.name ?? null;
                next.riderPhone = rider?.phone ?? null;
              }
              return next;
            })
          : prev,
      );
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setUpdating(null);
    }
  };

  const isLoading = loading || roleLoading || (isAdmin && orders === null);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <div className="animate-pulse rounded-2xl bg-white p-6 text-sm text-neutral-500 shadow-sm">
            Loading your dashboard...
          </div>
        </main>
      </>
    );
  }

  if (!isAdmin) return null;

  const list = orders ?? [];

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/admin"
          className="mb-4 inline-block text-sm text-neutral-500 hover:text-orange-600"
        >
          ← Back to dashboard
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
              Khadz operations
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
              Manage orders
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Track deliveries, update statuses, and assign riders.
            </p>
          </div>
          <span className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 shadow-sm">
            {list.length} total orders
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {list.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
              📋
            </span>
            <h2 className="text-xl font-extrabold text-neutral-900">
              No orders yet
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap justify-between gap-3 mb-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-neutral-900">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-neutral-900">
                      {formatCurrency(order.total)}
                    </p>
                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1.5 text-xs font-bold ${
                        STATUS_BADGE_CLASSES[order.status] ??
                        "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                </div>

                <div className="mb-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl border border-neutral-100 bg-[#faf8f5] p-4">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Customer
                    </p>
                    <p className="font-medium">
                      {order.customerName ?? "—"}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {order.customerEmail}
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-[#faf8f5] p-4">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Delivery
                    </p>
                    <p>{order.deliveryAddress ?? "—"}</p>
                    <p className="text-xs text-neutral-600">
                      {order.deliveryPhone ?? ""}
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm italic text-amber-900">
                    Note: {order.notes}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-5 text-sm">
                  <div className="flex-1 min-w-[200px]">
                    <label className="mb-2 block text-xs font-semibold text-neutral-600">
                      Rider
                    </label>
                    <select
                      value={order.riderId ?? ""}
                      onChange={(e) =>
                        patchOrder(order.id, {
                          riderId: e.target.value || null,
                        })
                      }
                      disabled={updating === order.id}
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:opacity-50"
                    >
                      <option value="">— Unassigned —</option>
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.phone})
                        </option>
                      ))}
                    </select>
                    {order.riderName && (
                      <p className="text-xs text-neutral-600 mt-1">
                        Assigned: {order.riderName} · {order.riderPhone}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="mb-2 block text-xs font-semibold text-neutral-600">
                      Status
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        patchOrder(order.id, {
                          status: e.target.value as OrderStatus,
                        })
                      }
                      disabled={updating === order.id}
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}