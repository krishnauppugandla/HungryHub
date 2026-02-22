# 🍔 HungryHub — Food Delivery Platform

A full-stack food delivery web app where customers can browse restaurants, place orders, and track deliveries in real time. Sellers manage their restaurant and incoming orders from a live dashboard. Admins oversee the entire platform.

Built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.io**.

---

## Tech Stack

**Frontend**
- React 19, React Router v6
- Tailwind CSS
- Socket.io client
- Axios with JWT interceptor + auto token refresh

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time order updates)
- JWT access tokens (15 min) + refresh tokens (7 days, httpOnly cookie)
- bcrypt password hashing
- express-rate-limit, helmet, CORS

---

## Features

### Customer
- Browse and search restaurants by name or cuisine
- View menus grouped by category with dietary tags (veg, spicy)
- Add items to cart, update quantities, remove items
- Apply promo codes for discounts
- Checkout with saved delivery addresses
- Real-time order tracking with live status updates via WebSocket
- Order history with reorder support
- Profile management — name, phone, saved addresses, password change

### Seller
- Restaurant dashboard with today's earnings and order stats
- Real-time new order alerts via Socket.io
- Accept, prepare, and dispatch orders with one click
- Menu management — add items, toggle availability, delete
- Restaurant settings — cuisine types, delivery fee, hours

### Admin
- Platform-wide stats (users, restaurants, revenue, orders)
- User management — search, filter by role, suspend accounts
- Restaurant management — feature/unfeature, activate/deactivate
- Order management with status override

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)

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

Create a `.env` file in `backend-v2/`:

```env
PORT=8001
MONGO_URI=mongodb://localhost:27017/hungryhub
CLIENT_URL=http://localhost:3000

JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

NODE_ENV=development
```

Seed the database with sample restaurants, menus, and users:

```bash
node scripts/seed.js --fresh
```

Start the backend:

```bash
nodemon server.js
# or: node server.js
```

Backend runs on **http://localhost:8001**

### 3. Set up the frontend

```bash
cd ../frontend-react
npm install
npm start
```

Frontend runs on **http://localhost:3000**

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Customer** | john@example.com | password123 |
| **Seller** | mario@example.com | password123 |
| **Admin** | admin@hungryhub.com | admin123456 |

> **Customer flow:** Log in → Browse restaurants → Add items to cart → Apply promo code `SAVE10` → Checkout → Track order
>
> **Seller flow:** Log in → View dashboard → Go to Orders tab to manage incoming orders → Menu tab to add/edit items
>
> **Admin flow:** Log in → View platform stats → Manage users and restaurants

---

## Project Structure

```
HungryHub/
├── backend-v2/
│   ├── controllers/        # Route handlers (auth, orders, cart, etc.)
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── middleware/         # Auth, error handler, rate limiter
│   ├── services/           # Token and email services
│   ├── utils/              # AppError, asyncHandler, apiResponse
│   ├── scripts/seed.js     # Database seeder
│   └── server.js           # Entry point + Socket.io setup
│
└── frontend-react/
    └── src/
        ├── pages/          # Landing, Restaurants, Cart, Checkout, Orders, Profile, Seller, Admin
        ├── contexts/       # AuthContext, CartContext
        ├── hooks/          # useSocket, useDebounce
        ├── services/api.js # Axios instance with token refresh interceptor
        ├── constants/api.js# All API endpoint constants
        └── shared/         # Reusable UI components and layouts
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive tokens |
| GET | `/api/restaurants` | List restaurants with search + pagination |
| GET | `/api/menu-items/restaurant/:id` | Get menu for a restaurant |
| POST | `/api/cart/add` | Add item to cart |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders/my` | Get customer's order history |
| PATCH | `/api/orders/:id/status` | Update order status (seller) |
| POST | `/api/promo/validate` | Validate and apply a promo code |
| GET | `/api/admin/stats` | Platform stats (admin only) |

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-order-room` | Client → Server | Customer subscribes to their order updates |
| `join-restaurant-room` | Client → Server | Seller subscribes to their restaurant's orders |
| `new-order` | Server → Seller | Fired when a customer places an order |
| `order-status-update` | Server → Customer | Fired when seller updates order status |

---

## Author

**Krishna Uppugandla**  
M.S. Computer Engineering  
[GitHub](https://github.com/krishnauppugandla) · [LinkedIn](https://linkedin.com/in/krishnauppugandla)
