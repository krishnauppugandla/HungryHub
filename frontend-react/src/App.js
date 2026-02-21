import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./shared/components/Navigation/Navbar";
import MobileNav from "./shared/components/Navigation/MobileNav";
import ProtectedRoute from "./shared/layouts/ProtectedRoute";

// Lazy-loaded pages — each is a separate chunk
const Landing          = lazy(() => import("./pages/Landing/Landing"));
const Login            = lazy(() => import("./pages/Auth/Login"));
const Register         = lazy(() => import("./pages/Auth/Register"));
const Restaurants      = lazy(() => import("./pages/Restaurants/RestaurantListing"));
const RestaurantDetail = lazy(() => import("./pages/Restaurants/RestaurantDetail"));
const Cart             = lazy(() => import("./pages/Cart/Cart"));
const Checkout         = lazy(() => import("./pages/Checkout/Checkout"));
const OrderConfirmation= lazy(() => import("./pages/Orders/OrderConfirmation"));
const OrderTracking    = lazy(() => import("./pages/Orders/OrderTracking"));
const OrderHistory     = lazy(() => import("./pages/Orders/OrderHistory"));
const Profile          = lazy(() => import("./pages/Profile/Profile"));
const SellerDashboard  = lazy(() => import("./pages/Seller/SellerDashboard"));
const AdminDashboard   = lazy(() => import("./pages/Admin/AdminDashboard"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full" />
  </div>
);

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error("ErrorBoundary caught:", error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="text-5xl mb-4">😵</div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">We hit an unexpected error. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Refresh Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 pb-16 md:pb-0">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public */}
                    <Route path="/"               element={<Landing />} />
                    <Route path="/login"          element={<Login />} />
                    <Route path="/register"       element={<Register />} />
                    <Route path="/restaurants"    element={<Restaurants />} />
                    <Route path="/restaurants/:id" element={<RestaurantDetail />} />

                    {/* Customer only */}
                    <Route path="/cart"     element={<ProtectedRoute role="customer"><Cart /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute role="customer"><Checkout /></ProtectedRoute>} />
                    <Route path="/orders/confirmation/:id" element={<ProtectedRoute role="customer"><OrderConfirmation /></ProtectedRoute>} />
                    <Route path="/orders/:id" element={<ProtectedRoute role="customer"><OrderTracking /></ProtectedRoute>} />
                    <Route path="/orders"   element={<ProtectedRoute role="customer"><OrderHistory /></ProtectedRoute>} />
                    <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                    {/* Seller only */}
                    <Route path="/seller/*" element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />

                    {/* Admin only */}
                    <Route path="/admin/*"  element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
              <MobileNav />
            </div>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: "12px", fontFamily: "Inter, sans-serif", fontSize: "14px" },
                success: { iconTheme: { primary: "#ef4444", secondary: "white" } },
              }}
            />
          </ErrorBoundary>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);

export default App;

