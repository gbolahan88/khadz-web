// app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup, getAuthErrorMessage } from "@/lib/auth";
import { syncUserToPostgres } from "@/lib/sync-user";
import { PasswordInput } from "@/components/password-input";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await signup(email, password, name);

      await syncUserToPostgres(user); // Sync user data to Postgres after signup

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f5f2] px-4 py-10 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-36 -top-40 h-96 w-96 rounded-full bg-orange-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-36 h-[30rem] w-[30rem] rounded-full bg-amber-100/70 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_100px_-40px_rgba(47,32,19,0.35)] md:min-h-[610px] md:grid-cols-[0.95fr_1.05fr]">
        <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-[#211b17] p-7 text-white sm:p-10 md:p-12">
          <Link href="/" className="relative inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-2xl shadow-lg shadow-orange-950/30">🍔</span>
            <span className="text-sm font-extrabold tracking-[0.18em]">KHADZ <span className="ml-1 font-medium tracking-[0.12em] text-orange-300">BURGER</span></span>
          </Link>
          <div className="relative mt-12 max-w-sm md:mt-0">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-orange-300">A little more delicious</p>
            <p className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">Good things<br />start here.</p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/65">Create your account to order your favorites and follow every delivery.</p>
          </div>
          <p className="relative mt-10 text-xs text-white/40 md:mt-0">Freshly made. Lovingly served.</p>
        </section>

        <section className="flex items-center px-7 py-10 sm:px-12 sm:py-14 md:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Join the table</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Create account</h1>
              <p className="mt-2 text-sm text-neutral-500">Get started with Khadz Burger.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-neutral-800">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-neutral-800">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-neutral-800"
            >
              Password
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={setPassword}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 border-t border-neutral-100 pt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-orange-600 transition hover:text-orange-700 hover:underline">
            Log in
          </Link>
        </p>
          </div>
        </section>
      </div>
    </main>
  );
}