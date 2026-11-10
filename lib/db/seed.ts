// lib/db/seed.ts
import { db } from "./index";
import { products } from "./schema";

const productsData = [
  {
    name: "Classic Cheeseburger",
    price: "3500.00",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    category: "Burgers Classic",
    description: "Beef patty, cheddar cheese, lettuce, tomato, house sauce",
    rating: "4.5",
    deliveryInfo: "30–45 mins",
    availabilityStatus: "In Stock",
  },
  {
    name: "Double Bacon Burger",
    price: "5200.00",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800",
    category: "Burgers Premium",
    description: "Two beef patties, crispy bacon, cheese, BBQ sauce",
    rating: "4.8",
    deliveryInfo: "30–45 mins",
    availabilityStatus: "In Stock",
    discountPercentage: 10,
  },
  {
    name: "Spicy Chicken Burger",
    price: "4200.00",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800",
    category: "Burgers Chicken",
    description: "Crispy chicken fillet, spicy mayo, jalapeños",
    rating: "4.6",
    deliveryInfo: "30–45 mins",
    availabilityStatus: "In Stock",
  },
  {
    name: "Veggie Burger",
    price: "3800.00",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800",
    category: "Burgers Veggie",
    description: "Plant-based patty, avocado, lettuce, tomato",
    rating: "4.3",
    deliveryInfo: "30–45 mins",
    availabilityStatus: "In Stock",
  },
  {
    name: "Loaded Fries",
    price: "2500.00",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800",
    category: "Sides Fries",
    description: "Fries topped with cheese sauce, bacon bits, green onions",
    rating: "4.7",
    deliveryInfo: "20–30 mins",
    availabilityStatus: "In Stock",
  },
  {
    name: "Chocolate Milkshake",
    price: "2800.00",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800",
    category: "Drinks Shakes",
    description: "Thick chocolate milkshake with whipped cream",
    rating: "4.9",
    deliveryInfo: "15–20 mins",
    availabilityStatus: "In Stock",
  },
  {
    name: "Coca-Cola (Can)",
    price: "500.00",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800",
    category: "Drinks Soda",
    description: "330ml can, chilled",
    rating: "4.2",
    deliveryInfo: "10–15 mins",
    availabilityStatus: "In Stock",
  },
  {
    name: "BBQ Wings (6pc)",
    price: "4500.00",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800",
    category: "Sides Wings",
    description: "Six BBQ-glazed chicken wings",
    rating: "4.7",
    deliveryInfo: "25–35 mins",
    availabilityStatus: "In Stock",
  },
];

async function seed() {
  console.log("🌱 Seeding products...");
  await db.delete(products);
  const inserted = await db.insert(products).values(productsData).returning();
  console.log(`✅ Inserted ${inserted.length} products`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});