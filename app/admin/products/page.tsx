// app/admin/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { useAuth } from "@/context/auth-context";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  description: string | null;
  rating: string | null;
  deliveryInfo: string | null;
  availabilityStatus: string | null;
};

type EditingProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
  availabilityStatus: string;
};

const EMPTY_FORM = {
  name: "",
  price: "",
  image: "",
  category: "",
  description: "",
  availabilityStatus: "In Stock",
};

export default function AdminProductsPage() {
  const { user, isAdmin, loading, roleLoading } = useAuth();

  const [products, setProducts] = useState<Product[] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<EditingProduct | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/admin/products-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (loading || roleLoading) return;
    if (!user || !isAdmin) return;

    let cancelled = false;

    const load = async () => {
      try {
        const token = await user.getIdToken(true);
        const res = await fetch("/api/admin/products-list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) setProducts(data.products ?? []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setProducts([]);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, loading, roleLoading]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setError("");
  };

  const startEdit = (p: Product) => {
    setEditing({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
      description: p.description ?? "",
      availabilityStatus: p.availabilityStatus ?? "In Stock",
    });
    setForm({
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
      description: p.description ?? "",
      availabilityStatus: p.availabilityStatus ?? "In Stock",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);

    try {
      const token = await user.getIdToken(true);
      const isEdit = editing !== null;
      const url = isEdit
        ? `/api/admin/products/${editing!.id}`
        : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Save failed");
        return;
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Delete this product? Past orders will keep their records.")) return;
    setDeleting(id);
    setError("");

    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Delete failed");
        return;
      }

      setProducts((prev) =>
        prev ? prev.filter((p) => p.id !== id) : prev,
      );
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setDeleting(null);
    }
  };

  if (loading || roleLoading || (isAdmin && products === null)) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <div className="animate-pulse rounded-2xl bg-white p-6 text-sm text-neutral-500 shadow-sm">
            Loading products...
          </div>
        </main>
      </>
    );
  }

  if (!isAdmin) return null;

  const list = products ?? [];

  return (
    <>
      <Header />
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
              Products
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Add, edit, or remove items from the menu.
            </p>
          </div>
          <span className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 shadow-sm">
            {list.length} products
          </span>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">
              {editing ? `Edit: ${editing.name}` : "Add new product"}
            </h2>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-neutral-500 hover:text-red-600"
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Classic Cheeseburger"
                className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                Price (₦) *
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="3500"
                className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                Category *
              </label>
              <input
                required
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="Burgers Classic"
                className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                Availability
              </label>
              <select
                value={form.availabilityStatus}
                onChange={(e) =>
                  setForm({ ...form, availabilityStatus: e.target.value })
                }
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              >
                <option>In Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                Image URL *
              </label>
              <input
                required
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Beef patty, cheddar cheese, lettuce, tomato"
                className="w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Add product"}
            </button>
          </div>
        </form>

        {/* Grid */}
        {list.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
              🍔
            </span>
            <h2 className="text-xl font-extrabold text-neutral-900">
              No products yet
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Add your first item with the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="relative aspect-square">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="font-bold text-neutral-900">{p.name}</h3>
                    <span className="whitespace-nowrap text-sm font-semibold text-orange-600">
                      {formatCurrency(p.price)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">{p.category}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {p.availabilityStatus}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="flex-1 h-9 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="flex-1 h-9 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === p.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}