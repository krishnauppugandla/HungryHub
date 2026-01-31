export const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8001";
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8001";

export const API = {
  // Auth
  REGISTER:         "/api/auth/register",
  LOGIN:            "/api/auth/login",
  LOGOUT:           "/api/auth/logout",
  REFRESH:          "/api/auth/refresh",
  FORGOT_PASSWORD:  "/api/auth/forgot-password",
  RESET_PASSWORD:   (token) => `/api/auth/reset-password/${token}`,
  CHANGE_PASSWORD:  "/api/auth/change-password",
  ME:               "/api/auth/me",

  // OAuth
  GOOGLE_AUTH:   "/api/auth/google",
  FACEBOOK_AUTH: "/api/auth/facebook",
  APPLE_AUTH:    "/api/auth/apple",

  // Users
  PROFILE:          "/api/users/profile",
  TOGGLE_FAVORITE:  (id) => `/api/users/favorites/${id}`,

  // Restaurants
  RESTAURANTS:      "/api/restaurants",
  FEATURED:         "/api/restaurants/featured",
  MY_RESTAURANT:    "/api/restaurants/my",
  RESTAURANT:       (id) => `/api/restaurants/${id}`,
  TOGGLE_OPEN:      (id) => `/api/restaurants/${id}/toggle-open`,

  // Menu items
  MENU_BY_RESTAURANT: (id) => `/api/menu-items/restaurant/${id}`,
  MENU_ITEMS:       "/api/menu-items",
  MENU_ITEM:        (id) => `/api/menu-items/${id}`,
  MENU_AVAILABILITY:(id) => `/api/menu-items/${id}/availability`,

  // Cart
  CART:             "/api/cart",
  CART_ADD:         "/api/cart/add",
  CART_ITEM:        (id) => `/api/cart/item/${id}`,

  // Orders
  ORDERS:           "/api/orders",
  MY_ORDERS:        "/api/orders/my",
  RESTAURANT_ORDERS:"/api/orders/restaurant",
  ORDER:            (id) => `/api/orders/${id}`,
  ORDER_STATUS:     (id) => `/api/orders/${id}/status`,
  REORDER:          (id) => `/api/orders/${id}/reorder`,

  // Reviews
  RESTAURANT_REVIEWS: (id) => `/api/reviews/restaurant/${id}`,
  DELETE_REVIEW:    (id) => `/api/reviews/${id}`,

  // Addresses
  ADDRESSES:        "/api/addresses",
  ADDRESS:          (id) => `/api/addresses/${id}`,
  ADDRESS_DEFAULT:  (id) => `/api/addresses/${id}/default`,

  // Payment
  PAYMENT_INTENT:   "/api/payment/intent",

  // Promo
  VALIDATE_PROMO:   "/api/promo/validate",
  REMOVE_PROMO:     "/api/promo/remove",

  // Admin
  ADMIN_STATS:          "/api/admin/stats",
  ADMIN_USERS:          "/api/admin/users",
  ADMIN_SUSPEND_USER:   (id) => `/api/admin/users/${id}/suspend`,
  ADMIN_RESTAURANTS:    "/api/admin/restaurants",
  ADMIN_FEATURE_REST:   (id) => `/api/admin/restaurants/${id}/feature`,
  ADMIN_ACTIVATE_REST:  (id) => `/api/admin/restaurants/${id}/activate`,
  ADMIN_ORDERS:         "/api/admin/orders",
  ADMIN_ORDER_STATUS:   (id) => `/api/admin/orders/${id}/status`,
};
