// app/admin/page.tsx
"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { useAuth } from "@/context/auth-context";

export default function AdminHome() {
  const { user, isAdmin, loading, roleLoading } = useAuth();

  if (loading || roleLoading) {
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

  const cards = [
    {
      href: "/admin/orders",
      title: "Orders",
      desc: "Track deliveries, update statuses, assign riders",
      emoji: "📋",
    },
    {
      href: "/admin/riders",
      title: "Riders",
      desc: "Add riders and manage their availability",
      emoji: "🛵",
    },
    {
      href: "/admin/products",
      title: "Products",
      desc: "Add, edit, or remove menu items",
      emoji: "🍔",
    },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                {card.emoji}
              </span>
              <h2 className="text-lg font-bold text-neutral-900 group-hover:text-orange-600">
                {card.title}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">{card.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}