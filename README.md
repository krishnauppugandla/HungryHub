<div align="center">

# 🍔 HungryHub

### A full-stack multi-vendor food delivery platform

[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**[🚀 Live Demo](https://hungry-hub-opal.vercel.app)** &nbsp;·&nbsp; **[📡 API](https://hungryhub-ldbp.onrender.com/health)**

> ⚡ First load may take 30–50 seconds — the backend is on Render's free tier and sleeps after inactivity.

</div>

---

## What is HungryHub?

HungryHub is a production-style food delivery web app with three fully separate user roles — **customer**, **restaurant owner**, and **admin** — each with their own dedicated experience. It implements the kind of real-world features you'd find in apps like DoorDash or Uber Eats: live order tracking, a promo code engine, role-based access control, JWT auth with silent refresh, and WebSocket-based push notifications.

The entire stack is built from scratch — no app templates, no prebuilt admin panels.

---

## Key Technical Highlights

- **Real-time order tracking** using Socket.io rooms — customers and sellers each join separate rooms, and status updates push instantly without polling
- **JWT auth with silent refresh** — short-lived access tokens (15 min) auto-refresh in the background using httpOnly cookie refresh tokens (7 days), keeping users logged in without re-prompting
- **Role-based access control** enforced at both the Express middleware layer and React route level — no seller can touch customer routes and vice versa
- **Promo code engine** with per-user usage limits, minimum order validation, and discount persistence stored on the cart — consumed cleanly at order creation
- **MongoDB aggregation pipelines** powering the admin dashboard — today's revenue, order counts, and platform stats computed server-side
- **Rate limiting + Helmet** — API is protected with environment-aware rate limits (relaxed in dev, strict in production)

---

## Features by Role

<details>
<summary><b>👤 Customer</b></summary>

- Browse and search restaurants by name or cuisine
- View menus with vegetarian and spicy tags
- Add items to cart, update quantities, remove items
- Apply promo codes for discounts before checkout
- Save multiple delivery addresses and set a default
- Place orders (cash on delivery or card)
- Real-time order status tracking with a live progress bar
- Full order history with itemized details

</details>

<details>
<summary><b>🏪 Seller (Restaurant Owner)</b></summary>

- Dashboard with today's revenue, order count, and status breakdown
- Real-time new order alerts via Socket.io — no page refresh needed
- Update order status through the full lifecycle: Accept → Preparing → Out for Delivery → Delivered
- Add, edit, toggle availability, and delete menu items
- Update restaurant info — cuisine types, delivery fee, estimated time, open/close toggle

</details>

<details>
<summary><b>🛡️ Admin</b></summary>

- Platform-wide stats — total users, restaurants, revenue, and today's orders
- Search and filter users by role, suspend accounts
- Feature or deactivate restaurants
- View and override any order's status

</details>

---

## Live Demo

**URL:** https://hungry-hub-opal.vercel.app

### Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@hungryhub.com | Customer@123 |
| Seller — Mario's Pizzeria | mario@hungryhub.com | Seller@123 |
| Seller — Jake's Burger Joint | jake@hungryhub.com | Seller@123 |
| Seller — Sakura Sushi | yuki@hungryhub.com | Seller@123 |
| Seller — La Taqueria | sofia@hungryhub.com | Seller@123 |
| Seller — Spice Garden | priya@hungryhub.com | Seller@123 |
| Admin | admin@hungryhub.com | Admin@123 |

### Promo Codes

| Code | Benefit | Min. Order |
|------|---------|------------|
| `WELCOME20` | 20% off (max $10) | $15 |
| `HUNGRY5` | $5 off | $25 |
| `FREESHIP` | Free delivery | Any |

### Suggested Test Flow

**To see real-time updates in action:**
1. Open two browser windows side by side
2. In window 1 — log in as **Customer**, add items to cart, place an order
3. In window 2 — log in as the matching **Seller** (e.g. mario@hungryhub.com for Mario's Pizzeria)
4. In the seller window, go to Orders → accept the order
5. Watch window 1 — the order tracking page updates live without any refresh

---

## Getting Started Locally

### Prerequisites

- Node.js 18+
- MongoDB running locally

### 1. Clone

```bash
git clone https://github.com/krishnauppugandla/HungryHub.git
cd HungryHub
```

### 2. Backend setup

```bash
cd backend-v2
npm install
```

Create `backend-v2/.env`:

```env
PORT=8001
MONGO_URI=mongodb://localhost:27017/hungryhub
CLIENT_URL=http://localhost:3000

JWT_ACCESS_SECRET=any_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

NODE_ENV=development
```

Seed the database (creates 7 users, 5 restaurants, full menus, and 3 promo codes):

```bash
node scripts/seed.js
```

Start the server:

```bash
nodemon server.js
```

Runs on **http://localhost:8001**

### 3. Frontend setup

```bash
# In a new terminal
cd frontend-react
npm install
npm start
```

Runs on **http://localhost:3000**

The same demo credentials work locally after seeding.

---

## Project Structure

```
HungryHub/
├── backend-v2/
│   ├── controllers/       # Auth, cart, orders, restaurants, menu items, promo, admin
│   ├── models/            # User, Restaurant, MenuItem, Order, Cart, PromoCode, Review
│   ├── routes/            # Express routers — one file per resource
│   ├── middleware/        # JWT auth guard, global error handler, rate limiter
│   ├── services/          # Token signing/verification, email service
│   ├── utils/             # AppError, asyncHandler, apiResponse
│   ├── scripts/seed.js    # One-command database seeder
│   └── server.js          # Entry point — Express + Socket.io setup
│
└── frontend-react/
    └── src/
        ├── pages/         # Auth, Landing, Restaurants, Cart, Checkout, Orders,
        │                  # Profile, Seller Dashboard, Admin Dashboard
        ├── contexts/      # AuthContext — user state + token management
        │                  # CartContext — cart state + sync with backend
        ├── hooks/         # useSocket (Socket.io connection), useDebounce
        ├── services/      # Axios instance with JWT interceptor + silent token refresh
        ├── constants/     # All API endpoint strings centralised
        └── shared/        # Navbar, ProtectedRoute, reusable UI components
```

---

## API Reference

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new account |
| POST | `/api/auth/login` | Public | Login — returns access token + sets refresh cookie |
| POST | `/api/auth/refresh` | Public | Silent token refresh using httpOnly cookie |
| POST | `/api/auth/logout` | User | Invalidate refresh token |
| GET | `/api/restaurants` | Public | List with search, cuisine filter, pagination |
| GET | `/api/restaurants/featured` | Public | Featured restaurants |
| POST | `/api/restaurants` | Seller | Create restaurant |
| PATCH | `/api/restaurants/:id` | Seller | Update restaurant |
| PATCH | `/api/restaurants/:id/toggle-open` | Seller | Toggle open/closed |
| GET | `/api/menu-items/restaurant/:id` | Public | Get restaurant menu |
| POST | `/api/menu-items` | Seller | Add menu item |
| PATCH | `/api/menu-items/:id` | Seller | Update menu item |
| POST | `/api/cart/add` | Customer | Add item to cart |
| PATCH | `/api/cart/item/:itemId` | Customer | Update quantity |
| DELETE | `/api/cart/item/:itemId` | Customer | Remove item |
| POST | `/api/promo/validate` | Customer | Apply promo code to cart |
| POST | `/api/promo/remove` | Customer | Remove applied promo |
| POST | `/api/orders` | Customer | Place order |
| GET | `/api/orders/my` | Customer | Order history |
| GET | `/api/orders/:id` | User | Single order detail |
| PATCH | `/api/orders/:id/status` | Seller | Update order status |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | All users with filters |
| GET | `/api/admin/orders` | Admin | All orders |

---

## Socket.io Events

| Event | Direction | Trigger |
|-------|-----------|---------|
| `join-order-room` | Client → Server | Customer opens order tracking page |
| `join-restaurant-room` | Client → Server | Seller opens their dashboard |
| `new-order` | Server → Seller | Customer places an order |
| `order-status-update` | Server → Customer | Seller changes order status |

---

## Author

**Krishna Uppugandla**  
M.S. Computer Engineering  
[GitHub](https://github.com/krishnauppugandla) · [LinkedIn](https://linkedin.com/in/krishnauppugandla)
