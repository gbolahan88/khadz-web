// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { formatCurrency } from "@/lib/format";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ShoppingBag, TrendingUp, Users, Truck } from "lucide-react";

type Period = "daily" | "weekly" | "monthly" | "yearly";

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  totalCustomers: number;
  chartData: {
    revenue: { label: string; revenue: number }[];
    statuses: { name: string; value: number }[];
  };
};

const COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

export default function AdminHome() {
  const { user, isAdmin, loading, roleLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState<Period>("daily");
  const [completedRequestKey, setCompletedRequestKey] = useState<string | null>(null);
  const requestKey = user ? `${user.uid}:${period}` : null;
  const chartLoading = Boolean(
    requestKey && isAdmin && completedRequestKey !== requestKey,
  );

  useEffect(() => {
    if (loading || roleLoading) return;
    if (!user || !isAdmin) return;

    let cancelled = false;

    const loadStats = async () => {
      try {
        const token = await user.getIdToken(true);
        const res = await fetch(`/api/admin/stats?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        if (!cancelled && requestKey) setCompletedRequestKey(requestKey);
      }
    };

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, loading, roleLoading, period, requestKey]);

  if (loading || roleLoading || (isAdmin && !stats)) {
    return (
      <>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <div className="animate-pulse rounded-2xl bg-white p-6 text-sm text-neutral-500 shadow-sm">
            Loading your dashboard...
          </div>
        </main>
      </>
    );
  }

  if (!isAdmin) return null;

  const cards = [
    {
      href: "/admin/orders",
      title: "Orders",
      desc: "Track deliveries, update statuses, assign riders",
      icon: <ShoppingBag className="h-6 w-6 text-orange-600" />,
    },
    {
      href: "/admin/riders",
      title: "Riders",
      desc: "Add riders and manage their availability",
      icon: <Truck className="h-6 w-6 text-orange-600" />,
    },
    {
      href: "/admin/products",
      title: "Products",
      desc: "Add, edit, or remove menu items",
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            Khadz operations
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Welcome back, {user?.displayName?.split(" ")[0] || user?.email}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Revenue
            </p>
            <span className="rounded-full bg-green-100 p-1.5 text-green-600">
              <TrendingUp className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-neutral-900">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Active Orders
            </p>
            <span className="rounded-full bg-orange-100 p-1.5 text-orange-600">
              <ShoppingBag className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-orange-600">
            {stats?.activeOrders || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Total Orders
            </p>
            <span className="rounded-full bg-blue-100 p-1.5 text-blue-600">
              <ShoppingBag className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-neutral-900">
            {stats?.totalOrders || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Customers
            </p>
            <span className="rounded-full bg-purple-100 p-1.5 text-purple-600">
              <Users className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-neutral-900">
            {stats?.totalCustomers || 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Revenue</h2>
            <div className="flex rounded-lg bg-neutral-100 p-1">
              {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
                    period === p
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 w-full relative">
            {chartLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <span className="text-sm font-medium text-neutral-500">Loading...</span>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData?.revenue || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#737373" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#737373" }} axisLine={false} tickLine={false} tickFormatter={(value) => `₦${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-neutral-900">Order Status</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.chartData?.statuses || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {(stats?.chartData?.statuses || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <h2 className="mb-4 text-lg font-bold text-neutral-900">Manage</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
          >
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              {card.icon}
            </span>
            <h2 className="text-lg font-bold text-neutral-900 group-hover:text-orange-600">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}