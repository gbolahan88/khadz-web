// components/product-card.tsx
"use client";

import Image from "next/image";
import { StarRating } from "./star-rating";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-950/5">
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
        />
      </div>
      <div className="flex flex-1 flex-col items-start p-3 sm:p-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-orange-600">{product.category}</p>
        <h3 className="mb-2 line-clamp-2 text-left text-sm font-bold leading-5 text-neutral-900">
          {product.name}
        </h3>
        {product.availabilityStatus && (
          <p className="mb-3 text-xs font-medium text-emerald-700">
            {product.availabilityStatus}
          </p>
        )}
        <div className="mb-3 flex flex-col w-full justify-between gap-1 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-extrabold text-neutral-900">
            {formatCurrency(product.price)}
          </p>
          <div className="flex items-center gap-1">
          <StarRating rating={product.rating} />
            <span className="text-xs font-semibold text-neutral-500">{product.rating}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              category: product.category,
              rating: product.rating,
              availabilityStatus: product.availabilityStatus ?? undefined,
            })
          }
          className="mt-auto h-10 w-full rounded-xl bg-orange-500 text-xs font-bold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/25"
        >
          Add to cart <span aria-hidden="true">+</span>
        </button>
      </div>
    </article>
  );
}