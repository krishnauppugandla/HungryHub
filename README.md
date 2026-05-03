# 🍔 HungryHub — Food Delivery Platform

A full-stack multi-vendor food delivery platform where customers browse restaurants, place orders, and track deliveries in real time. Restaurant owners manage menus and incoming orders from a live dashboard. Admins oversee the entire platform.

**Live Demo:** https://hungry-hub-opal.vercel.app  
**Backend API:** https://hungryhub-ldbp.onrender.com

> ⚠️ The backend is hosted on Render's free tier and spins down after 15 minutes of inactivity. The first request may take 30–50 seconds to wake it up. Subsequent requests are fast.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router v7, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT access tokens (15 min) + refresh tokens (7 days, httpOnly cookie) |
| Real-time | Socket.io (order status push notifications) |
| Security | bcrypt, helmet, express-rate-limit, CORS |

---

## Features

### Customer
- Browse and search restaurants by name or cuisine type
- View menus with dietary tags (vegetarian, spicy)
- Add to cart, adjust quantities, remove items
- Apply promo codes at checkout for discounts
- Save multiple delivery addresses, set a default
- Place orders with cash on delivery or card
- Real-time order status tracking via WebSocket
- Order history with full order details

### Seller (Restaurant Owner)
- Dashboard with today's revenue, order count, and recent activity
- Real-time new order alerts pushed via Socket.io
- Update order status: Accept → Preparing → Out for Delivery → Delivered
- Menu management — add, edit, toggle availability, delete items
- Restaurant settings — name, cuisine, delivery fee, estimated time, open/close toggle

### Admin
- Platform stats — total users, restaurants, revenue, and today's orders
- User management — search by name/email, filter by role, suspend accounts
- Restaurant management — feature/unfeature, activate/deactivate
- Order management with status override

---

## Try the Live Demo

Visit **https://hungry-hub-opal.vercel.app** and use one of the accounts below.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Customer** | customer@hungryhub.com | Customer@123 |
| **Seller** — Mario's Pizzeria | mario@hungryhub.com | Seller@123 |
| **Seller** — Jake's Burger Joint | jake@hungryhub.com | Seller@123 |
| **Seller** — Sakura Sushi | yuki@hungryhub.com | Seller@123 |
| **Seller** — La Taqueria | sofia@hungryhub.com | Seller@123 |
| **Seller** — Spice Garden | priya@hungryhub.com | Seller@123 |
| **Admin** | admin@hungryhub.com | Admin@123 |

### Promo Codes

| Code | Discount | Minimum Order |
|------|----------|---------------|
| `WELCOME20` | 20% off (max $10) | $15 |
| `HUNGRY5` | $5 off | $25 |
| `FREESHIP` | Free delivery | Any amount |

### How to test each role

**As a Customer:**
1. Log in with `customer@hungryhub.com`
2. Browse restaurants on the Restaurants page
3. Click a restaurant → add items to your cart
4. Go to Cart → apply a promo code → proceed to Checkout
5. Fill in a delivery address → place the order
6. You'll be redirected to the Order Tracking page with live status updates

**As a Seller:**
1. Log in with any seller account (e.g. `mario@hungryhub.com`)
2. You land on the Seller Dashboard — see today's stats
3. Go to the **Orders** tab to see incoming orders and update their status
4. Go to the **Menu** tab to add or manage menu items
5. Go to **Settings** to update restaurant info or toggle open/closed

**As an Admin:**
1. Log in with `admin@hungryhub.com`
2. View platform-wide stats at the top
3. Use the **Users** tab to search and manage accounts
4. Use the **Restaurants** tab to feature or deactivate restaurants
5. Use the **Orders** tab to view and override any order's status

> **Tip:** Open two browser windows — one as a customer placing an order and one as the matching seller — to see real-time Socket.io updates in action.

---

## Run Locally

### Prerequisites
- Node.js 18+
- MongoDB installed and running locally

### 1. Clone the repo

```bash
git clone https://github.com/krishnauppugandla/HungryHub.git
cd HungryHub
```

### 2. Set up the backend

```bash
cd backend-v2
npm install
```

Create a `.env` file inside `backend-v2/`:

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

Seed the database with restaurants, menus, users, and promo codes:

```bash
node scripts/seed.js
```

This creates all the demo accounts listed above and 5 restaurants with full menus.

Start the backend:

```bash
nodemon server.js
```

Backend runs at **http://localhost:8001**

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend-react
npm install
npm start
```

Frontend runs at **http://localhost:3000**

Log in with any of the demo credentials above — they work the same locally and on the live demo.

---

## Project Structure

```
HungryHub/
├── backend-v2/
│   ├── controllers/        # Request handlers — auth, cart, orders, restaurants, etc.
│   ├── models/             # Mongoose schemas — User, Restaurant, MenuItem, Order, Cart, etc.
│   ├── routes/             # Express routers — one file per resource
│   ├── middleware/         # JWT auth, error handler, rate limiter
│   ├── services/           # Token signing/verification, email service
│   ├── utils/              # AppError, asyncHandler, apiResponse helpers
│   ├── scripts/seed.js     # Database seeder
│   └── server.js           # App entry point + Socket.io setup
│
└── frontend-react/
    └── src/
        ├── pages/
        │   ├── Auth/           # Login, Register
        │   ├── Landing/        # Home page
        │   ├── Restaurants/    # Restaurant listing + detail
        │   ├── Cart/           # Cart page
        │   ├── Checkout/       # Checkout flow
        │   ├── Orders/         # Order history, confirmation, tracking
        │   ├── Profile/        # User profile + saved addresses
        │   ├── Seller/         # Seller dashboard
        │   └── Admin/          # Admin dashboard
        ├── contexts/           # AuthContext (user + tokens), CartContext (cart state)
        ├── hooks/              # useSocket, useDebounce
        ├── services/api.js     # Axios instance with JWT interceptor + silent token refresh
        ├── constants/api.js    # All API endpoint strings in one place
        └── shared/             # Reusable components — Navbar, ProtectedRoute, UI elements
```

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create a new account |
| POST | `/api/auth/login` | Public | Login, receive access + refresh tokens |
| POST | `/api/auth/logout` | User | Invalidate refresh token |
| GET | `/api/restaurants` | Public | List restaurants with search + pagination |
| GET | `/api/restaurants/:id` | Public | Get single restaurant |
| POST | `/api/restaurants` | Seller | Create a restaurant |
| PATCH | `/api/restaurants/:id` | Seller | Update restaurant details |
| GET | `/api/menu-items/restaurant/:id` | Public | Get menu for a restaurant |
| POST | `/api/menu-items` | Seller | Add a menu item |
| POST | `/api/cart/add` | Customer | Add item to cart |
| PATCH | `/api/cart/item/:itemId` | Customer | Update cart item quantity |
| DELETE | `/api/cart/item/:itemId` | Customer | Remove item from cart |
| POST | `/api/promo/validate` | Customer | Validate and apply a promo code |
| POST | `/api/orders` | Customer | Place an order |
| GET | `/api/orders/my` | Customer | Get order history |
| PATCH | `/api/orders/:id/status` | Seller | Update order status |
| GET | `/api/admin/stats` | Admin | Platform-wide stats |

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-order-room` | Client → Server | Customer subscribes to updates for a specific order |
| `join-restaurant-room` | Client → Server | Seller subscribes to their restaurant's order stream |
| `new-order` | Server → Seller | Fires when a customer places an order |
| `order-status-update` | Server → Customer | Fires when a seller updates order status |

---

## Author

**Krishna Uppugandla**  
M.S. Computer Engineering  
[GitHub](https://github.com/krishnauppugandla) · [LinkedIn](https://linkedin.com/in/krishnauppugandla)
