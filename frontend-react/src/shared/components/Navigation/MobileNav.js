import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";

const MobileNav = () => {
  const { user, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { pathname } = useLocation();

  if (!isAuthenticated) return null;

  const active = (path) => pathname === path ? "text-red-500" : "text-gray-400";
  const ico = (path, icon, label, badge) => (
    <Link to={path} className={`flex flex-col items-center gap-0.5 text-xs font-medium relative ${active(path)}`}>
      <span className="text-xl relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-50 md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4">
        {ico("/restaurants", "🏠", "Home")}
        {user?.role === "customer" && ico("/cart", "🛒", "Cart", itemCount)}
        {user?.role === "customer" && ico("/orders", "📦", "Orders")}
        {user?.role === "seller" && ico("/seller", "🏪", "Dashboard")}
        {user?.role === "admin" && ico("/admin", "⚙️", "Admin")}
        {ico("/profile", "👤", "Profile")}
      </div>
    </nav>
  );
};

export default MobileNav;
