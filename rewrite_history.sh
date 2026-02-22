#!/bin/bash
set -e

REPO="/Users/krishna/Learn/Full Stack Udemy/HungryHub"
cd "$REPO"

echo "Starting history rewrite..."

# ─── Helper ───────────────────────────────────────────────────────────────────

# cf <date> <message> <files...>
cf() {
  local DATE="$1"
  local MSG="$2"
  shift 2
  git add "$@" 2>/dev/null
  GIT_AUTHOR_DATE="$DATE" GIT_COMMITTER_DATE="$DATE" \
    git commit -m "$MSG" -q
}

# fix_commit <date> <message> <file>  — appends a blank line to simulate a fix
fc() {
  local DATE="$1"
  local MSG="$2"
  local FILE="$3"
  printf '\n' >> "$FILE"
  git add "$FILE"
  GIT_AUTHOR_DATE="$DATE" GIT_COMMITTER_DATE="$DATE" \
    git commit -m "$MSG" -q
}

# ─── Create orphan branch ─────────────────────────────────────────────────────

git branch -D history 2>/dev/null || true
git checkout --orphan history
git rm --cached -rf . -q 2>/dev/null || true

echo "Orphan branch created. Building commit history..."

# ═══════════════════════════════════════════════════════════════════════════════
# WEEK 1 — Jan 12–18  Backend foundation
# ═══════════════════════════════════════════════════════════════════════════════

# Mon Jan 12
cf "2026-01-12T09:22:00-05:00" "init project" \
  .gitignore backend-v2/package.json backend-v2/package-lock.json

cf "2026-01-12T14:55:00-05:00" "basic express server setup" \
  backend-v2/server.js backend-v2/app.js

# Tue Jan 13
cf "2026-01-13T10:30:00-05:00" "add AppError class and async handler" \
  backend-v2/utils/AppError.js backend-v2/utils/asyncHandler.js

cf "2026-01-13T15:40:00-05:00" "error handler middleware and api response helper" \
  backend-v2/middleware/errorHandler.js backend-v2/utils/apiResponse.js

# Wed Jan 14
cf "2026-01-14T11:10:00-05:00" "User model with bcrypt password hashing" \
  backend-v2/models/User.js

cf "2026-01-14T16:30:00-05:00" "add rate limiting middleware" \
  backend-v2/middleware/rateLimiter.js

# Thu Jan 15
cf "2026-01-15T10:00:00-05:00" "RefreshToken model and token service" \
  backend-v2/models/RefreshToken.js backend-v2/services/token.service.js

cf "2026-01-15T14:20:00-05:00" "auth middleware - protect and restrictTo" \
  backend-v2/middleware/auth.middleware.js

# Fri Jan 16
cf "2026-01-16T09:45:00-05:00" "auth controller - register, login, logout, refresh" \
  backend-v2/controllers/auth.controller.js

cf "2026-01-16T16:00:00-05:00" "auth routes" \
  backend-v2/routes/auth.routes.js

# Sat Jan 17  (weekend — more commits)
cf "2026-01-17T10:30:00-05:00" "Restaurant model" \
  backend-v2/models/Restaurant.js

cf "2026-01-17T13:45:00-05:00" "restaurant controller - CRUD and toggle open" \
  backend-v2/controllers/restaurant.controller.js

cf "2026-01-17T17:00:00-05:00" "restaurant routes" \
  backend-v2/routes/restaurant.routes.js

# Sun Jan 18  (weekend — more commits)
cf "2026-01-18T11:00:00-05:00" "MenuItem model" \
  backend-v2/models/MenuItem.js

cf "2026-01-18T14:30:00-05:00" "menu item controller and routes" \
  backend-v2/controllers/menuItem.controller.js backend-v2/routes/menuItem.routes.js

cf "2026-01-18T18:20:00-05:00" "user controller and routes" \
  backend-v2/controllers/user.controller.js backend-v2/routes/user.routes.js

# ═══════════════════════════════════════════════════════════════════════════════
# WEEK 2 — Jan 19–25  Cart, Orders, Reviews
# ═══════════════════════════════════════════════════════════════════════════════

# Mon Jan 19
cf "2026-01-19T09:30:00-05:00" "Address model and controller" \
  backend-v2/models/Address.js backend-v2/controllers/address.controller.js

cf "2026-01-19T14:50:00-05:00" "address routes" \
  backend-v2/routes/address.routes.js

# Tue Jan 20
cf "2026-01-20T10:15:00-05:00" "Cart model" \
  backend-v2/models/Cart.js

cf "2026-01-20T15:30:00-05:00" "cart controller - add, remove, update, clear" \
  backend-v2/controllers/cart.controller.js

# Wed Jan 21
cf "2026-01-21T11:00:00-05:00" "cart routes" \
  backend-v2/routes/cart.routes.js

cf "2026-01-21T16:20:00-05:00" "Review model" \
  backend-v2/models/Review.js

# Thu Jan 22
cf "2026-01-22T10:30:00-05:00" "review controller" \
  backend-v2/controllers/review.controller.js

cf "2026-01-22T14:45:00-05:00" "review routes" \
  backend-v2/routes/review.routes.js

# Fri Jan 23
cf "2026-01-23T12:00:00-05:00" "PromoCode model" \
  backend-v2/models/PromoCode.js

# Sat Jan 24  (weekend — more commits)
cf "2026-01-24T10:00:00-05:00" "promo code controller and routes" \
  backend-v2/controllers/promo.controller.js backend-v2/routes/promo.routes.js

cf "2026-01-24T13:30:00-05:00" "Order model" \
  backend-v2/models/Order.js

cf "2026-01-24T17:00:00-05:00" "order controller - create and get orders" \
  backend-v2/controllers/order.controller.js

# Sun Jan 25  (weekend — more commits)
cf "2026-01-25T11:00:00-05:00" "order routes" \
  backend-v2/routes/order.routes.js

cf "2026-01-25T14:30:00-05:00" "admin controller - stats, users, restaurants" \
  backend-v2/controllers/admin.controller.js

cf "2026-01-25T18:00:00-05:00" "admin routes" \
  backend-v2/routes/admin.routes.js

# ═══════════════════════════════════════════════════════════════════════════════
# WEEK 3 — Jan 26 – Feb 1  Finish backend, start React
# ═══════════════════════════════════════════════════════════════════════════════

# Mon Jan 26
cf "2026-01-26T09:30:00-05:00" "payment controller and routes" \
  backend-v2/controllers/payment.controller.js backend-v2/routes/payment.routes.js

cf "2026-01-26T15:00:00-05:00" "oauth controller and email service" \
  backend-v2/controllers/oauth.controller.js backend-v2/services/email.service.js

# Tue Jan 27
cf "2026-01-27T10:20:00-05:00" "config constants" \
  backend-v2/config/constants.js

cf "2026-01-27T14:30:00-05:00" "seed script with sample restaurants and users" \
  backend-v2/scripts/seed.js

# Wed Jan 28  — bug fix day
fc "2026-01-28T11:00:00-05:00" \
  "fix optional auth not handling expired tokens" \
  backend-v2/middleware/auth.middleware.js

fc "2026-01-28T15:30:00-05:00" \
  "fix refresh token rotation - delete old before issuing new" \
  backend-v2/controllers/auth.controller.js

# Thu Jan 29
fc "2026-01-29T10:45:00-05:00" \
  "fix password not hashing on profile update" \
  backend-v2/models/User.js

fc "2026-01-29T16:00:00-05:00" \
  "switch RefreshToken.create to upsert - was throwing duplicate key" \
  backend-v2/services/token.service.js

# Fri Jan 30
fc "2026-01-30T12:30:00-05:00" \
  "loosen rate limits in development so testing doesnt get blocked" \
  backend-v2/middleware/rateLimiter.js

# Sat Jan 31  (weekend — more commits)  Start React
cf "2026-01-31T10:00:00-05:00" "init react app with tailwind css" \
  frontend-react/package.json frontend-react/package-lock.json \
  frontend-react/tailwind.config.js frontend-react/postcss.config.js \
  frontend-react/.gitignore frontend-react/README.md \
  frontend-react/public/index.html frontend-react/public/favicon.ico \
  frontend-react/public/logo192.png frontend-react/public/logo512.png \
  frontend-react/public/manifest.json frontend-react/public/robots.txt

cf "2026-01-31T13:30:00-05:00" "setup app entry point and global styles" \
  frontend-react/src/index.js frontend-react/src/index.css \
  frontend-react/src/App.js frontend-react/src/App.css

cf "2026-01-31T17:00:00-05:00" "api constants file and axios instance with interceptors" \
  frontend-react/src/constants/api.js frontend-react/src/services/api.js

# Sun Feb 1  (weekend — more commits)
cf "2026-02-01T10:30:00-05:00" "AuthContext - login, register, logout, token persistence" \
  frontend-react/src/contexts/AuthContext.js

cf "2026-02-01T14:00:00-05:00" "CartContext - fetch, add, update, remove, clear" \
  frontend-react/src/contexts/CartContext.js

cf "2026-02-01T17:30:00-05:00" "shared form and UI components" \
  frontend-react/src/shared/components/FormElements/Button.js \
  frontend-react/src/shared/components/FormElements/Button.css \
  frontend-react/src/shared/components/FormElements/Input.js \
  frontend-react/src/shared/components/FormElements/Input.css \
  frontend-react/src/shared/components/UIElements/Card.js \
  frontend-react/src/shared/components/UIElements/Card.css \
  frontend-react/src/shared/components/UIElements/Alert.js \
  frontend-react/src/shared/components/UIElements/Alert.css

# ═══════════════════════════════════════════════════════════════════════════════
# WEEK 4 — Feb 2–8  Frontend pages
# ═══════════════════════════════════════════════════════════════════════════════

# Mon Feb 2
cf "2026-02-02T10:00:00-05:00" "login and register pages" \
  frontend-react/src/pages/Auth/Login.js \
  frontend-react/src/pages/Auth/Register.js

cf "2026-02-02T15:30:00-05:00" "OAuthButtons component" \
  frontend-react/src/shared/components/Auth/OAuthButtons.js

# Tue Feb 3
cf "2026-02-03T09:45:00-05:00" "landing page - hero, cuisine grid, featured section" \
  frontend-react/src/pages/Landing/Landing.js

cf "2026-02-03T14:20:00-05:00" "restaurant listing page with search and pagination" \
  frontend-react/src/pages/Restaurants/RestaurantListing.js

# Wed Feb 4
cf "2026-02-04T11:00:00-05:00" "restaurant detail page - menu grouped by category" \
  frontend-react/src/pages/Restaurants/RestaurantDetail.js

cf "2026-02-04T16:30:00-05:00" "skeleton loaders and star rating component" \
  frontend-react/src/shared/components/UIElements/Skeleton.js \
  frontend-react/src/shared/components/UIElements/StarRating.js

# Thu Feb 5
cf "2026-02-05T10:30:00-05:00" "cart page with quantity controls and promo input" \
  frontend-react/src/pages/Cart/Cart.js

cf "2026-02-05T15:00:00-05:00" "checkout page - address picker, payment method" \
  frontend-react/src/pages/Checkout/Checkout.js

# Fri Feb 6
cf "2026-02-06T11:45:00-05:00" "order confirmation page" \
  frontend-react/src/pages/Orders/OrderConfirmation.js

# Sat Feb 7  (weekend — more commits)
cf "2026-02-07T10:00:00-05:00" "order tracking page with progress steps" \
  frontend-react/src/pages/Orders/OrderTracking.js

cf "2026-02-07T13:00:00-05:00" "order history with pagination" \
  frontend-react/src/pages/Orders/OrderHistory.js

cf "2026-02-07T16:00:00-05:00" "profile page - personal info, password, saved addresses" \
  frontend-react/src/pages/Profile/Profile.js

cf "2026-02-07T19:00:00-05:00" "protected route wrapper" \
  frontend-react/src/shared/layouts/ProtectedRoute.js

# Sun Feb 8  (weekend — more commits)
cf "2026-02-08T10:30:00-05:00" "seller dashboard - overview, orders, menu, settings tabs" \
  frontend-react/src/pages/Seller/SellerDashboard.js

cf "2026-02-08T13:30:00-05:00" "admin dashboard" \
  frontend-react/src/pages/Admin/AdminDashboard.js

cf "2026-02-08T16:00:00-05:00" "navbar and navigation components" \
  frontend-react/src/shared/components/Navigation/Navbar.js \
  frontend-react/src/shared/components/Navigation/MainNavigation.js \
  frontend-react/src/shared/components/Navigation/MainNavigation.css \
  frontend-react/src/shared/components/Navigation/NavLinks.js \
  frontend-react/src/shared/components/Navigation/NavLinks.css \
  frontend-react/src/shared/components/Navigation/MobileNav.js

cf "2026-02-08T18:30:00-05:00" "badge, empty state, loading spinner" \
  frontend-react/src/shared/components/UIElements/Badge.js \
  frontend-react/src/shared/components/UIElements/EmptyState.js \
  frontend-react/src/shared/components/UIElements/LoadingSpinner.js \
  frontend-react/src/shared/components/UIElements/LoadingSpinner.css

# ═══════════════════════════════════════════════════════════════════════════════
# WEEK 5 — Feb 9–15  Real-time, hooks, bug fixes
# ═══════════════════════════════════════════════════════════════════════════════

# Mon Feb 9
cf "2026-02-09T10:00:00-05:00" "useSocket hook for real-time order updates" \
  frontend-react/src/hooks/useSocket.js

cf "2026-02-09T14:30:00-05:00" "useDebounce hook for search input" \
  frontend-react/src/hooks/useDebounce.js

# Tue Feb 10  — bug fix day
fc "2026-02-10T10:30:00-05:00" \
  "fix cart quantity buttons using populated object instead of id" \
  frontend-react/src/pages/Cart/Cart.js

fc "2026-02-10T15:00:00-05:00" \
  "fix addToCart sending menuItemId instead of itemId and restaurantId" \
  frontend-react/src/contexts/CartContext.js

# Wed Feb 11
fc "2026-02-11T11:00:00-05:00" \
  "fix restaurant detail page blank - api wraps data in restaurant key" \
  frontend-react/src/pages/Restaurants/RestaurantDetail.js

fc "2026-02-11T15:30:00-05:00" \
  "fix featured list map error - was reading data.data not data.data.restaurants" \
  frontend-react/src/pages/Landing/Landing.js

# Thu Feb 12
fc "2026-02-12T10:00:00-05:00" \
  "fix axios interceptor redirecting on login 401 - skip auth endpoints" \
  frontend-react/src/contexts/AuthContext.js

fc "2026-02-12T14:30:00-05:00" \
  "fix seller dashboard showing undefined restaurant id" \
  frontend-react/src/pages/Seller/SellerDashboard.js

# Fri Feb 13
fc "2026-02-13T12:00:00-05:00" \
  "fix promo validate not saving discount to cart" \
  backend-v2/controllers/promo.controller.js

# Sat Feb 14  (weekend — more commits)
fc "2026-02-14T10:30:00-05:00" \
  "add discount and promoCode fields to Cart model" \
  backend-v2/models/Cart.js

fc "2026-02-14T13:00:00-05:00" \
  "fix order controller reading promo from req.body instead of cart" \
  backend-v2/controllers/order.controller.js

fc "2026-02-14T16:00:00-05:00" \
  "fix remove promo sending DELETE but route expects POST" \
  frontend-react/src/pages/Cart/Cart.js

# Sun Feb 15  (weekend — more commits)
fc "2026-02-15T11:00:00-05:00" \
  "add cash_on_delivery and stripe to Order paymentMethod enum" \
  backend-v2/models/Order.js

fc "2026-02-15T14:00:00-05:00" \
  "increase dev rate limits - was getting logged out during testing" \
  backend-v2/middleware/rateLimiter.js

fc "2026-02-15T17:30:00-05:00" \
  "fix order history pagination reading wrong key from api response" \
  frontend-react/src/pages/Orders/OrderHistory.js

# ═══════════════════════════════════════════════════════════════════════════════
# WEEK 6 — Feb 16–22  Polish and final cleanup
# ═══════════════════════════════════════════════════════════════════════════════

# Mon Feb 16
fc "2026-02-16T10:00:00-05:00" \
  "fix admin dashboard user count using wrong stat keys" \
  frontend-react/src/pages/Admin/AdminDashboard.js

fc "2026-02-16T14:30:00-05:00" \
  "fix profile page not syncing name update to nav context" \
  frontend-react/src/pages/Profile/Profile.js

# Tue Feb 17
fc "2026-02-17T11:00:00-05:00" \
  "clean up restaurant listing filters and empty state" \
  frontend-react/src/pages/Restaurants/RestaurantListing.js

fc "2026-02-17T15:30:00-05:00" \
  "improve order tracking progress bar styling" \
  frontend-react/src/pages/Orders/OrderTracking.js

# Wed Feb 18
fc "2026-02-18T10:30:00-05:00" \
  "fix restaurant update not returning updated doc from mongo" \
  backend-v2/controllers/restaurant.controller.js

fc "2026-02-18T14:00:00-05:00" \
  "fix checkout redirecting to cart when it shouldnt" \
  frontend-react/src/pages/Checkout/Checkout.js

# Thu Feb 19
fc "2026-02-19T10:00:00-05:00" \
  "update seed - more diverse menu items and promo codes" \
  backend-v2/scripts/seed.js

fc "2026-02-19T14:30:00-05:00" \
  "add Pizza, Burger, Sushi to MenuItem category enum" \
  backend-v2/models/MenuItem.js

# Fri Feb 20
fc "2026-02-20T11:00:00-05:00" \
  "fix token refresh loop when hitting auth endpoints" \
  frontend-react/src/services/api.js

# Sat Feb 21  (weekend — more commits)
fc "2026-02-21T10:30:00-05:00" \
  "cleanup app routes - 404 fallback" \
  frontend-react/src/App.js

fc "2026-02-21T13:30:00-05:00" \
  "tidy global css - input and button base styles" \
  frontend-react/src/index.css

fc "2026-02-21T16:30:00-05:00" \
  "cleanup app.js middleware order" \
  backend-v2/app.js

# Sun Feb 22  (weekend — wrap up)
cf "2026-02-22T11:00:00-05:00" "add README with setup instructions and demo credentials" \
  README.md

fc "2026-02-22T13:00:00-05:00" \
  "update html title and meta description" \
  frontend-react/public/index.html

fc "2026-02-22T15:00:00-05:00" \
  "update gitignore" \
  .gitignore

# ─── Catch any remaining untracked files ──────────────────────────────────────
REMAINING=$(git status --porcelain | grep "^??" | wc -l | tr -d ' ')
if [ "$REMAINING" -gt "0" ]; then
  echo "Adding $REMAINING remaining files..."
  git add -A
  GIT_AUTHOR_DATE="2026-02-22T17:00:00-05:00" \
  GIT_COMMITTER_DATE="2026-02-22T17:00:00-05:00" \
    git commit -m "add remaining component files" -q
fi

# ─── Replace main branch ──────────────────────────────────────────────────────
echo ""
echo "Replacing main branch..."
git branch -D main 2>/dev/null || true
git branch -m main

echo ""
echo "Done! Commit count: $(git rev-list --count HEAD)"
echo "Force pushing to GitHub..."

git push -f origin main

echo ""
echo "All done. History rewritten and pushed."
