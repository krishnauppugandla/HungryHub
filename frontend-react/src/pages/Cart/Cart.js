import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import api from "../../services/api";
import { API } from "../../constants/api";
import EmptyState from "../../shared/components/UIElements/EmptyState";
import toast from "react-hot-toast";

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const deliveryFee = cart.restaurant?.deliveryFee ?? 2.99;
  const discount = cart.discount || 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const { data } = await api.post(API.VALIDATE_PROMO, { code: promoInput.trim() });
      toast.success(data.message);
      setPromoInput("");
      fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid promo code.");
    } finally { setPromoLoading(false); }
  };

  const removePromo = async () => {
    try { await api.post(API.REMOVE_PROMO); fetchCart(); toast.success("Promo removed"); }
    catch { toast.error("Could not remove promo."); }
  };

  if (loading) return (
    <div className="page-container py-10 flex justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!cart.items?.length) return (
    <div className="page-container py-10">
      <EmptyState icon="🛒" title="Your cart is empty"
        message="Add items from a restaurant to get started."
        action={<Link to="/restaurants" className="btn-primary">Browse restaurants</Link>} />
    </div>
  );

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold mb-6">Your cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Items ── */}
        <div className="flex-1 space-y-3">
          {cart.restaurant && (
            <div className="flex items-center gap-3 card p-4 mb-4">
              <img src={cart.restaurant.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="font-semibold">{cart.restaurant.name}</p>
                <p className="text-xs text-gray-500">Min. order: ${cart.restaurant.minimumOrder}</p>
              </div>
              <button onClick={() => { if (window.confirm("Clear cart?")) clearCart(); }} className="ml-auto text-xs text-red-500 hover:underline">Clear cart</button>
            </div>
          )}

          {cart.items.map((item) => (
            <div key={item.menuItem || item._id} className="card p-4 flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-red-500 font-semibold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-semibold">
                  −
                </button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-red-500 hover:bg-red-50 font-semibold">
                  +
                </button>
              </div>
              <p className="font-semibold w-16 text-right">${(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeItem(item._id)} className="text-gray-300 hover:text-red-500 transition-colors">✕</button>
            </div>
          ))}
        </div>

        {/* ── Summary ── */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card p-6 space-y-4 sticky top-20">
            <h2 className="font-bold text-lg">Order summary</h2>

            {/* Promo code */}
            {cart.promoCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm">
                <span className="text-green-700 font-semibold">🎉 {cart.promoCode} applied</span>
                <button onClick={removePromo} className="text-red-500 hover:underline text-xs">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Promo code" className="input-field text-sm" />
                <button onClick={applyPromo} disabled={promoLoading} className="btn-outline text-sm px-4 py-2 flex-shrink-0">
                  {promoLoading ? "..." : "Apply"}
                </button>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−${discount.toFixed(2)}</span></div>}
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            <button onClick={() => navigate("/checkout")} className="btn-primary w-full text-base py-3">
              Proceed to checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

