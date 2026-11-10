// app/admin/riders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

type Rider = {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
  createdAt: string;
};

export default function AdminRidersPage() {
  const { user, isAdmin, loading, roleLoading } = useAuth();

  const [riders, setRiders] = useState<Rider[] | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadRiders = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/admin/riders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRiders(data.riders ?? []);
    } catch (err) {
      console.error(err);
      setRiders([]);
    }
  };

  useEffect(() => {
    if (loading || roleLoading) return;
    if (!user || !isAdmin) return;

    let cancelled = false;

    const load = async () => {
      try {
        const token = await user.getIdToken(true);
        const res = await fetch("/api/admin/riders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) setRiders(data.riders ?? []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setRiders([]);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, loading, roleLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);

    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/admin/riders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not add rider");
        return;
      }

      setName("");
      setPhone("");
      await loadRiders();
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Delete this rider? Any orders assigned will become unassigned.")) return;
    setDeleting(id);
    setError("");

    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/admin/riders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Delete failed");
        return;
      }

      setRiders((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setDeleting(null);
    }
  };

  if (loading || roleLoading || (isAdmin && riders === null)) {
    return (
      <>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <div className="animate-pulse rounded-2xl bg-white p-6 text-sm text-neutral-500 shadow-sm">
            Loading riders...
          </div>
        </main>
      </>
    );
  }

  if (!isAdmin) return null;

  const list = riders ?? [];

  return (
    <>
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
              Riders
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Add delivery riders and manage the list.
            </p>
          </div>
          <span className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 shadow-sm">
            {list.length} riders
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Add form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              Add rider
            </h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tunde Okafor"
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Phone
                </label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 123 4567"
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="h-11 w-full rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add rider"}
              </button>
            </div>
          </form>

          {/* List */}
          <div className="md:col-span-2">
            {list.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm">
                <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                  🛵
                </span>
                <p className="text-sm text-neutral-500">
                  No riders yet. Add one with the form.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-neutral-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Added
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((rider) => (
                      <tr
                        key={rider.id}
                        className="border-t border-neutral-100 hover:bg-neutral-50"
                      >
                        <td className="px-4 py-3 font-medium">{rider.name}</td>
                        <td className="px-4 py-3 text-neutral-600">
                          {rider.phone}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500">
                          {new Date(rider.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(rider.id)}
                            disabled={deleting === rider.id}
                            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deleting === rider.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}