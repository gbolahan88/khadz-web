// components/header.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { logout } from "@/lib/auth";

export function Header() {
  const { user, loading } = useAuth();
  const { getTotalItems, clearCart } = useCart();
  const router = useRouter();
  const totalItems = getTotalItems();

  const handleLogout = async () => {
    clearCart(); // Clear the cart when logging out
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-xl shadow-sm shadow-orange-500/25">
            🍔
          </span>
          <span className="text-base font-extrabold tracking-tight text-neutral-900 sm:text-lg">
            Khadz <span className="text-orange-600">Burger</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/cart"
            className="relative rounded-lg px-2 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
          >
            Cart
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user && (
            <Link href="/orders" className="rounded-lg px-2 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700">
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
                className="rounded-lg px-2 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-red-50 hover:text-red-600"
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
      </div>
    </header>
  );
}