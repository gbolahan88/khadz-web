// lib/db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  discountPercentage: integer("discount_percentage"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  deliveryInfo: text("delivery_info"),
  availabilityStatus: text("availability_status").default("In Stock"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export const users = pgTable("users", {
  firebaseUid: text("firebase_uid").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: varchar("role", { length: 20 }).default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// RIDERS  (NEW)
// ─────────────────────────────────────────────

export const riders = pgTable("riders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.firebaseUid, { onDelete: "cascade" }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  // NEW: nullable — only set when admin assigns a rider
  riderId: uuid("rider_id").references(() => riders.id, {
    onDelete: "set null",
  }),
  // NEW: delivery details (previously discarded — now stored)
  deliveryAddress: text("delivery_address"),
  deliveryPhone: text("delivery_phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// ORDER ITEMS
// ─────────────────────────────────────────────

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: decimal("price_at_purchase", {
    precision: 10,
    scale: 2,
  }).notNull(),
});