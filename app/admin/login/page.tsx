// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAsAdmin, getAuthErrorMessage } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginAsAdmin(email, password);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f5f2] px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-36 -top-40 h-96 w-96 rounded-full bg-orange-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-36 h-[30rem] w-[30rem] rounded-full bg-amber-100/70 blur-3xl"
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_100px_-40px_rgba(47,32,19,0.35)] md:min-h-[610px] md:grid-cols-[0.95fr_1.05fr]">
        <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-[#211b17] p-7 text-white sm:p-10 md:p-12">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[40px] border-orange-500/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-orange-500/10 blur-2xl"
          />

          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-2xl shadow-lg shadow-orange-950/30">
                🍔
              </span>
              <span className="text-sm font-extrabold tracking-[0.18em]">
                KHADZ
                <span className="ml-1 font-medium tracking-[0.12em] text-orange-300">
                  BURGER
                </span>
              </span>
            </Link>
          </div>

          <div className="relative mt-12 max-w-sm md:mt-0">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-orange-300">
              Admin portal
            </p>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
              Good food.
              <br />
              Great business.
            </h1>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/65">
              Sign in to manage orders and keep the good stuff moving.
            </p>
          </div>

          <p className="relative mt-10 text-xs text-white/40 md:mt-0">
            Freshly made. Lovingly managed.
          </p>
        </section>

        <section className="flex items-center px-7 py-10 sm:px-12 sm:py-14 md:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                Welcome back
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
                Admin sign in
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Enter your details to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-sm font-semibold text-neutral-800"
                >
                  Email address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-semibold text-neutral-800"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-neutral-500 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
                  >
                    {showPassword ? (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.7 4.7 9.5 6-.3.5-1.3 1.9-2.8 3.2M6.2 6.2C3.9 7.7 2.7 9.7 2.5 11c.8 1.3 4.3 6 9.5 6 1 0 1.9-.2 2.8-.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                        />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Log in to dashboard"}
              </button>
            </form>

            <p className="mt-8 border-t border-neutral-100 pt-6 text-center text-sm text-neutral-500">
              Not an admin?{" "}
              <Link
                href="/"
                className="font-semibold text-orange-600 transition hover:text-orange-700 hover:underline"
              >
                Go to storefront
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}