// app/home-client.tsx
"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/products";

export function HomeClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category.split(" ")[0]));
    return ["All", ...unique];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory, products]);

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            aria-label="Search burgers"
            placeholder="Search burgers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-12 pr-4 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => {
            const isActive = c === selectedCategory;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedCategory(c)}
                className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#211b17] text-white shadow-sm"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 py-16 text-center">
          <p className="text-lg font-bold text-neutral-800">Nothing on the menu yet</p>
          <p className="mt-2 text-sm text-neutral-500">Try another search or category.</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-neutral-900">The menu</h2>
            <span className="text-xs font-medium text-neutral-500">{filtered.length} delicious picks</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          </div>
        </div>
      )}
    </>
  );
}