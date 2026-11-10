// lib/products.ts
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { cacheLife } from "next/cache";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string | null;
  discountPercentage: number | null;
  rating: number;
  deliveryInfo: string | null;
  availabilityStatus: string | null;
};

export async function getProducts(): Promise<Product[]> {
  'use cache'
  cacheLife('minutes')
  const rows = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    image: row.image,
    category: row.category,
    description: row.description,
    discountPercentage: row.discountPercentage,
    rating: Number(row.rating ?? 0),
    deliveryInfo: row.deliveryInfo,
    availabilityStatus: row.availabilityStatus,
  }));
}