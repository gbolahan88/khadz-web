// app/page.tsx
import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { Header } from "@/components/header";
import { HomeClient } from "./home-client";

async function HomeProducts() {
  const products = await getProducts();
  return <HomeClient products={products} />;
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="relative mb-8 overflow-hidden rounded-[1.75rem] bg-[#211b17] px-6 py-9 text-white shadow-xl shadow-orange-950/10 sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-28 h-80 w-80 rounded-full border-[44px] border-orange-500/10"
          />
          <div className="relative max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Made fresh, made for you
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Your next favorite
              <span className="block text-orange-400">is on the menu.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65 sm:text-base">
              Fresh, juicy burgers and feel-good bites, made just for you. 🍔
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="py-16 text-center text-sm text-neutral-500" aria-busy="true">
              Loading the menu...
            </div>
          }
        >
          <HomeProducts />
        </Suspense>
      </main>
    </>
  );
}