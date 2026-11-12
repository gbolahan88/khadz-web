// components/header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { logout } from "@/lib/auth";
import Image from "next/image";
import { Menu, ShoppingCart, X, Headset, List } from "lucide-react";

export function Header() {
  const { user, loading } = useAuth();
  const { getTotalItems, clearCart } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // NEW: State to track if we are on the client
  const [mounted, setMounted] = useState(false);

  // NEW: Set mounted to true only after the first client-side render
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Only calculate totalItems if mounted, otherwise default to 0
  const totalItems = mounted ? getTotalItems() : 0;

  const handleLogout = async () => {
    setMenuOpen(false);
    clearCart();
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-sm shadow-orange-500/25"
            src="/Khadzlogo.png"
            alt="Khadz Burger Logo"
            width={70}
            height={70}
          />
          <span className="text-base font-extrabold tracking-tight text-neutral-900 sm:text-lg">
            Khadz <span className="text-[#f8a609]">Burger</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-3 sm:gap-5 md:flex">
          <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Home
            </Link>
          <Link
            href="/cart"
            className="relative flex gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
          >
            <ShoppingCart aria-hidden="true" className="h-5 w-5" />
            Cart
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </Link>

          <a
              href="https://wa.me/2348139498576"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg flex gap-1 px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
            >
              <Headset aria-hidden="true" className="h-5 w-5" />
              Support
            </a>

          {user && (
            <Link href="/orders" className="rounded-lg flex gap-2 px-2 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700">
              <List aria-hidden="true" className="h-5 w-5" />
              Orders
            </Link>
          )}

          {loading ? (
            <span className="text-xs text-neutral-400">Checking...</span>
          ) : user ? (
            <>
              <span className="hidden text-sm text-neutral-500 lg:inline">
                Hi, <span className="font-semibold text-neutral-800">{user.displayName?.split(" ")[0] || user.email}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-2 py-2 text-sm font-semibold text-neutral-600 transition bg-red-600 text-white hover:bg-red-50 hover:text-red-600"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-2 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
            className="relative rounded-lg p-2 text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
          >
            <ShoppingCart aria-hidden="true" className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
          >
            {menuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-b border-neutral-200 bg-white px-4 py-3 shadow-lg md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-1">
            <Link
              href="/"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Home
            </Link>
            {user && (
              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
              >
                Orders
              </Link>
            )}
            <a
              href="https://wa.me/2348139498576"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Support
            </a>
            {loading ? (
              <span className="px-3 py-2.5 text-xs text-neutral-400">
                Checking...
              </span>
            ) : user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-neutral-600 transition bg-red-600 text-white hover:bg-red-50 hover:text-red-600"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}