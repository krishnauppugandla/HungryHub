import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { API } from "../constants/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, restaurant: null, discount: 0, promoCode: null });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== "customer") return;
    try {
      setLoading(true);
      const { data } = await api.get(API.CART);
      // backend returns { cart: {...} } or { cart: null, items: [], restaurant: null }
      const cartData = data.data.cart || data.data;
      setCart(cartData || { items: [], subtotal: 0, restaurant: null, discount: 0, promoCode: null });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (itemId, restaurantId, quantity = 1) => {
    try {
      await api.post(API.CART_ADD, { itemId, restaurantId, quantity });
      await fetchCart();
      toast.success("Added to cart!");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add item.");
      return false;
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (menuItemId, quantity) => {
    try {
      await api.patch(API.CART_ITEM(menuItemId), { quantity });
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update cart.");
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (menuItemId) => {
    try {
      await api.delete(API.CART_ITEM(menuItemId));
      await fetchCart();
      toast.success("Item removed");
    } catch { toast.error("Could not remove item."); }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      await api.delete(API.CART);
      setCart({ items: [], subtotal: 0, restaurant: null, discount: 0, promoCode: null });
    } catch { /* silent */ }
  }, []);

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
