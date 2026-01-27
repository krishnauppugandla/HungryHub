/**
 * HungryHub Seed Script
 * ---------------------
 * Creates test accounts + 5 popular restaurants with full menus.
 *
 * Usage:
 *   cd backend-v2
 *   node scripts/seed.js
 *
 * To wipe everything first:
 *   node scripts/seed.js --fresh
 *
 * NOTE: Passwords are plain text here — the User model's pre-save bcrypt hook
 * hashes them automatically. Never pre-hash (would cause double-hashing bug).
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const User       = require("../models/User");
const Restaurant = require("../models/Restaurant");
const MenuItem   = require("../models/MenuItem");
const PromoCode  = require("../models/PromoCode");

const FRESH = process.argv.includes("--fresh");
const CREDENTIALS = [];
const note = (label, email, password) => CREDENTIALS.push({ label, email, password });

// ── Restaurants data ──────────────────────────────────────────────────────────
const RESTAURANTS = [
  {
    seller: { name: "Mario Rossi",   email: "mario@hungryhub.com",  password: "Seller@123" },
    restaurant: {
      name: "Mario's Pizzeria",
      description: "Authentic Neapolitan pizza with hand-tossed dough and San Marzano tomatoes. Family recipe since 1987.",
      cuisineType: ["Pizza", "Italian"],
      address: { street: "742 Evergreen Terrace", city: "Springfield", state: "IL", zipCode: "62701" },
      phone: "(217) 555-0101",
      deliveryFee: 2.99, minimumOrder: 12, estimatedDeliveryTime: 30,
      isFeatured: true, isOpen: true, priceRange: "$$",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
    },
    menu: [
      { name: "Margherita Pizza",     category: "Pizza",     price: 13.99, description: "Fresh mozzarella, basil, San Marzano tomatoes.", isVegetarian: true, calories: 780, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
      { name: "Pepperoni Pizza",      category: "Pizza",     price: 15.99, description: "Generous pepperoni, mozzarella, signature sauce.", calories: 920, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80" },
      { name: "BBQ Chicken Pizza",    category: "Pizza",     price: 16.99, description: "Smoky BBQ sauce, grilled chicken, red onion.", calories: 870 },
      { name: "Veggie Supreme Pizza", category: "Pizza",     price: 14.99, description: "Bell peppers, mushrooms, olives, onion, spinach.", isVegetarian: true, isVegan: true, calories: 710 },
      { name: "Caesar Salad",         category: "Appetizer", price: 8.99,  description: "Romaine, parmesan, croutons, Caesar dressing.", isVegetarian: true, calories: 340 },
      { name: "Garlic Bread",         category: "Side",      price: 4.99,  description: "Toasted ciabatta with herb butter.", isVegetarian: true, calories: 290 },
      { name: "Tiramisu",             category: "Dessert",   price: 6.99,  description: "Classic Italian dessert with mascarpone.", isVegetarian: true, calories: 420 },
      { name: "Sparkling Water",      category: "Beverage",  price: 2.49,  description: "San Pellegrino 500ml.", isVegetarian: true, isVegan: true, calories: 0 },
    ],
  },
  {
    seller: { name: "Jake Thompson", email: "jake@hungryhub.com",   password: "Seller@123" },
    restaurant: {
      name: "Jake's Burger Joint",
      description: "Smash burgers made with 100% Angus beef, never frozen. Crispy edges, juicy centers.",
      cuisineType: ["Burgers", "American"],
      address: { street: "1600 Pennsylvania Ave", city: "Chicago", state: "IL", zipCode: "60601" },
      phone: "(312) 555-0202",
      deliveryFee: 1.99, minimumOrder: 10, estimatedDeliveryTime: 25,
      isFeatured: true, isOpen: true, priceRange: "$$",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    },
    menu: [
      { name: "Classic Smash Burger",  category: "Burger", price: 11.99, description: "Double smash patty, American cheese, pickles, special sauce.", calories: 750, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80" },
      { name: "Bacon Cheeseburger",    category: "Burger", price: 13.99, description: "Crispy bacon, cheddar, lettuce, tomato, onion.", calories: 880 },
      { name: "Mushroom Swiss Burger", category: "Burger", price: 13.49, description: "Sautéed mushrooms, Swiss cheese, garlic aioli.", calories: 810 },
      { name: "Veggie Black Bean",     category: "Burger", price: 11.49, description: "House-made black bean patty, avocado, pico de gallo.", isVegetarian: true, isVegan: true, calories: 620 },
      { name: "Crispy Chicken Burger", category: "Burger", price: 12.99, description: "Buttermilk fried chicken, coleslaw, honey sriracha.", isSpicy: true, calories: 790 },
      { name: "Loaded Fries",          category: "Side",   price: 6.99,  description: "Crinkle fries, cheese sauce, jalapeños, bacon bits.", isSpicy: true, calories: 540 },
      { name: "Onion Rings",           category: "Side",   price: 4.99,  description: "Beer-battered onion rings, chipotle dipping sauce.", isVegetarian: true, calories: 390 },
      { name: "Chocolate Milkshake",   category: "Beverage", price: 5.99, description: "Thick hand-spun chocolate shake.", isVegetarian: true, calories: 680 },
      { name: "Vanilla Milkshake",     category: "Beverage", price: 5.99, description: "Classic hand-spun vanilla shake.", isVegetarian: true, calories: 620 },
    ],
  },
  {
    seller: { name: "Yuki Tanaka",   email: "yuki@hungryhub.com",   password: "Seller@123" },
    restaurant: {
      name: "Sakura Sushi",
      description: "Traditional Japanese sushi and ramen by chef Yuki Tanaka with 15 years of Osaka experience.",
      cuisineType: ["Sushi", "Japanese"],
      address: { street: "123 Cherry Blossom Lane", city: "San Francisco", state: "CA", zipCode: "94102" },
      phone: "(415) 555-0303",
      deliveryFee: 3.49, minimumOrder: 20, estimatedDeliveryTime: 40,
      isFeatured: true, isOpen: true, priceRange: "$$$",
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    },
    menu: [
      { name: "Salmon Nigiri (2pc)",   category: "Appetizer", price: 7.99,  description: "Fresh Atlantic salmon over seasoned rice.", calories: 140 },
      { name: "Tuna Roll",             category: "Main",      price: 12.99, description: "Fresh tuna, cucumber, avocado, sesame seeds.", calories: 320 },
      { name: "Dragon Roll",           category: "Main",      price: 16.99, description: "Shrimp tempura, avocado, cucumber, spicy mayo.", isSpicy: true, calories: 480 },
      { name: "Vegetable Roll",        category: "Main",      price: 10.99, description: "Cucumber, avocado, carrot, cream cheese.", isVegetarian: true, isVegan: true, calories: 260 },
      { name: "Ramen — Tonkotsu",      category: "Main",      price: 15.99, description: "Rich pork bone broth, chashu, soft egg, noodles.", calories: 680 },
      { name: "Edamame",               category: "Appetizer", price: 5.99,  description: "Steamed salted soybeans.", isVegetarian: true, isVegan: true, calories: 120 },
      { name: "Miso Soup",             category: "Side",      price: 3.49,  description: "Tofu, wakame seaweed, scallions.", isVegetarian: true, calories: 80 },
      { name: "Gyoza (6pc)",           category: "Appetizer", price: 8.99,  description: "Pan-fried pork and cabbage dumplings.", calories: 280 },
      { name: "Green Tea Ice Cream",   category: "Dessert",   price: 5.99,  description: "Three scoops of matcha ice cream.", isVegetarian: true, calories: 300 },
    ],
  },
  {
    seller: { name: "Sofia Ramirez", email: "sofia@hungryhub.com",  password: "Seller@123" },
    restaurant: {
      name: "La Taqueria",
      description: "Authentic Mexican street food — fresh handmade tortillas, slow-cooked meats, and bold salsas.",
      cuisineType: ["Mexican", "Fast Food"],
      address: { street: "500 Mission Street", city: "Los Angeles", state: "CA", zipCode: "90015" },
      phone: "(213) 555-0404",
      deliveryFee: 1.49, minimumOrder: 8, estimatedDeliveryTime: 20,
      isFeatured: false, isOpen: true, priceRange: "$",
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    },
    menu: [
      { name: "Carne Asada Tacos (3)",  category: "Main",      price: 12.99, description: "Grilled flank steak, onion, cilantro, salsa verde.", calories: 520 },
      { name: "Al Pastor Tacos (3)",    category: "Main",      price: 11.99, description: "Pineapple-marinated pork, onion, cilantro.", calories: 490 },
      { name: "Veggie Tacos (3)",       category: "Main",      price: 10.99, description: "Black beans, roasted peppers, corn, avocado.", isVegetarian: true, isVegan: true, calories: 420 },
      { name: "Burrito — Chicken",      category: "Main",      price: 10.99, description: "Grilled chicken, rice, beans, cheese, sour cream.", calories: 750 },
      { name: "Burrito — Veggie",       category: "Main",      price: 9.99,  description: "Grilled veggies, rice, black beans, guacamole.", isVegetarian: true, calories: 650 },
      { name: "Chips & Guacamole",      category: "Appetizer", price: 6.99,  description: "Fresh tortilla chips with house-made guacamole.", isVegetarian: true, isVegan: true, calories: 380 },
      { name: "Elote (Mexican Street Corn)", category: "Side", price: 4.99, description: "Grilled corn, cotija cheese, chili, lime.", isVegetarian: true, calories: 220 },
      { name: "Horchata",               category: "Beverage",  price: 3.99,  description: "Traditional rice milk with cinnamon.", isVegetarian: true, calories: 180 },
      { name: "Churros",                category: "Dessert",   price: 5.99,  description: "Fresh fried churros with chocolate sauce.", isVegetarian: true, calories: 350 },
    ],
  },
  {
    seller: { name: "Priya Sharma",  email: "priya@hungryhub.com",  password: "Seller@123" },
    restaurant: {
      name: "Spice Garden",
      description: "Aromatic North and South Indian cuisine made with freshly ground spices and traditional recipes.",
      cuisineType: ["Indian", "Mediterranean"],
      address: { street: "88 Curry Lane", city: "New York", state: "NY", zipCode: "10001" },
      phone: "(212) 555-0505",
      deliveryFee: 2.49, minimumOrder: 15, estimatedDeliveryTime: 35,
      isFeatured: false, isOpen: true, priceRange: "$$",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    },
    menu: [
      { name: "Butter Chicken",         category: "Main",      price: 15.99, description: "Tender chicken in rich tomato-butter sauce. Medium spice.", isSpicy: false, calories: 620 },
      { name: "Palak Paneer",           category: "Main",      price: 14.99, description: "Fresh cottage cheese in creamy spinach sauce.", isVegetarian: true, calories: 520 },
      { name: "Lamb Biryani",           category: "Main",      price: 17.99, description: "Slow-cooked basmati rice with tender lamb and saffron.", calories: 780 },
      { name: "Vegetable Biryani",      category: "Main",      price: 13.99, description: "Fragrant basmati rice with seasonal vegetables.", isVegetarian: true, isVegan: true, calories: 580 },
      { name: "Chicken Tikka Masala",   category: "Main",      price: 15.99, description: "Grilled chicken in spiced tomato-cream sauce.", calories: 640 },
      { name: "Garlic Naan (2pc)",      category: "Side",      price: 3.99,  description: "Freshly baked garlic naan from tandoor oven.", isVegetarian: true, calories: 260 },
      { name: "Samosa (2pc)",           category: "Appetizer", price: 5.99,  description: "Crispy pastry filled with spiced potatoes and peas.", isVegetarian: true, calories: 240 },
      { name: "Raita",                  category: "Side",      price: 3.49,  description: "Cooling yogurt with cucumber and mint.", isVegetarian: true, calories: 80 },
      { name: "Mango Lassi",            category: "Beverage",  price: 4.49,  description: "Refreshing yogurt drink with Alphonso mango.", isVegetarian: true, calories: 220 },
      { name: "Gulab Jamun",            category: "Dessert",   price: 5.99,  description: "Soft milk dumplings in rose-cardamom syrup.", isVegetarian: true, calories: 380 },
    ],
  },
];

// ── Promo codes ───────────────────────────────────────────────────────────────
const PROMOS = [
  {
    code: "WELCOME20",
    description: "20% off your first order",
    discountType: "percentage",
    discountValue: 20,
    minimumOrderAmount: 15,
    usageLimit: 1000,
    perUserLimit: 1,
    isActive: true,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    code: "HUNGRY5",
    description: "$5 off orders over $25",
    discountType: "fixed",
    discountValue: 5,
    minimumOrderAmount: 25,
    usageLimit: 500,
    perUserLimit: 3,
    isActive: true,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
  {
    code: "FREESHIP",
    description: "Free delivery on any order",
    discountType: "fixed",
    discountValue: 3,
    minimumOrderAmount: 0,
    usageLimit: 200,
    perUserLimit: 2,
    isActive: true,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  if (FRESH) {
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      MenuItem.deleteMany({}),
      PromoCode.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data\n");
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  const adminEmail = "admin@hungryhub.com";
  const adminPass  = "Admin@123";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({ name: "HungryHub Admin", email: adminEmail, password: adminPass, role: "admin", isActive: true });
    console.log("👤 Created admin account");
  } else {
    console.log("👤 Admin already exists — skipping");
  }
  note("Admin", adminEmail, adminPass);

  // ── Customer ──────────────────────────────────────────────────────────────
  const custEmail = "customer@hungryhub.com";
  const custPass  = "Customer@123";
  let customer = await User.findOne({ email: custEmail });
  if (!customer) {
    customer = await User.create({ name: "Test Customer", email: custEmail, password: custPass, role: "customer", isActive: true });
    console.log("👤 Created customer account");
  } else {
    console.log("👤 Customer already exists — skipping");
  }
  note("Customer", custEmail, custPass);

  // ── Restaurants + sellers ─────────────────────────────────────────────────
  console.log("\n🏪 Creating restaurants...\n");
  for (const data of RESTAURANTS) {
    const { seller: s, restaurant: r, menu } = data;

    let seller = await User.findOne({ email: s.email });
    if (!seller) {
      seller = await User.create({ name: s.name, email: s.email, password: s.password, role: "seller", isActive: true });
    }
    note(`Seller (${r.name})`, s.email, s.password);

    let restaurant = await Restaurant.findOne({ owner: seller._id });
    if (!restaurant) {
      restaurant = await Restaurant.create({ ...r, owner: seller._id });
      const items = menu.map((item) => ({ ...item, restaurant: restaurant._id, isAvailable: true }));
      await MenuItem.insertMany(items);
      console.log(`  ✅ ${r.name}`);
      console.log(`     └─ ${items.length} menu items added`);
    } else {
      console.log(`  ⏭️  ${r.name} already exists — skipping`);
    }
  }

  // ── Promo codes ───────────────────────────────────────────────────────────
  console.log("\n🎟️  Creating promo codes...");
  for (const promo of PROMOS) {
    const existing = await PromoCode.findOne({ code: promo.code });
    if (!existing) {
      await PromoCode.create(promo);
      console.log(`  ✅ ${promo.code} — ${promo.description}`);
    } else {
      console.log(`  ⏭️  ${promo.code} already exists — skipping`);
    }
  }

  // ── Print credentials ─────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(70));
  console.log("🔑  LOGIN CREDENTIALS");
  console.log("─".repeat(70));
  CREDENTIALS.forEach(({ label, email, password }) => {
    console.log(`  ${label.padEnd(30)} ${email.padEnd(35)} ${password}`);
  });
  console.log("─".repeat(70));
  console.log("\n  Promo codes to test at checkout:");
  console.log("    WELCOME20  — 20% off (max $10), orders over $15");
  console.log("    HUNGRY5    — $5 off, orders over $25");
  console.log("    FREESHIP   — ~$3 delivery fee waived, any order");
  console.log("\n✅ Seed complete!\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
