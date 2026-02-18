import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { API } from "../../constants/api";
import { useCart } from "../../contexts/CartContext";
import toast from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [instructions, setInstructions] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "Home", street: "", apartment: "", city: "", state: "", zipCode: "" });

  const subtotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const deliveryFee = cart.restaurant?.deliveryFee ?? 2.99;
  const discount = cart.discount || 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  useEffect(() => {
    api.get(API.ADDRESSES).then(({ data }) => {
      setAddresses(data.data);
      const def = data.data.find((a) => a.isDefault) || data.data[0];
      if (def) setSelectedAddress(def);
    }).catch(() => {});
  }, []);

  const saveNewAddress = async () => {
    try {
      const { data } = await api.post(API.ADDRESSES, newAddr);
      setAddresses((p) => [...p, data.data]);
      setSelectedAddress(data.data);
      setShowNewAddress(false);
      toast.success("Address saved");
    } catch (err) { toast.error(err.response?.data?.message || "Could not save address."); }
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast.error("Please select a delivery address."); return; }
    if (!phone) { toast.error("Please enter your phone number."); return; }

    setLoading(true);
    try {
      const payload = {
        deliveryAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          label: selectedAddress.label,
        },
        deliveryInstructions: instructions,
        phone,
        paymentMethod,
      };
      const { data } = await api.post(API.ORDERS, payload);
      await clearCart();
      toast.success("Order placed! 🎉");
      navigate(`/orders/confirmation/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order.");
    } finally { setLoading(false); }
  };

  if (!cart.items?.length) {
    navigate("/cart"); return null;
  }

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Left: delivery + payment ── */}
        <div className="flex-1 space-y-6">
          {/* Delivery address */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Delivery address</h2>
            <div className="space-y-2 mb-4">
              {addresses.map((a) => (
                <button key={a._id} onClick={() => setSelectedAddress(a)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${selectedAddress?._id === a._id ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className="font-medium">{a.label} {a.isDefault && <span className="text-xs text-red-500 ml-1">(Default)</span>}</p>
                  <p className="text-sm text-gray-600">{a.street}{a.apartment ? `, ${a.apartment}` : ""}, {a.city}, {a.state} {a.zipCode}</p>
                </button>
              ))}
              <button onClick={() => setShowNewAddress(!showNewAddress)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors text-sm font-medium">
                + Add new address
              </button>
            </div>

            {showNewAddress && (
              <div className="border-t pt-4 grid grid-cols-2 gap-3">
                {["label","street","apartment","city","state","zipCode"].map((f) => (
                  <div key={f} className={f === "street" || f === "apartment" ? "col-span-2" : ""}>
                    <label className="text-xs text-gray-600 capitalize mb-1 block">{f === "zipCode" ? "ZIP Code" : f}</label>
                    <input value={newAddr[f]} onChange={(e) => setNewAddr((p) => ({ ...p, [f]: e.target.value }))}
                      className="input-field text-sm" placeholder={f === "apartment" ? "Optional" : ""} />
                  </div>
                ))}
                <button onClick={saveNewAddress} className="btn-primary col-span-2 text-sm py-2.5">Save address</button>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="input-field" placeholder="(555) 000-0000" type="tel" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Delivery instructions</label>
                <input value={instructions} onChange={(e) => setInstructions(e.target.value)}
                  className="input-field" placeholder="Leave at door, ring bell..." />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Payment method</h2>
            <div className="grid grid-cols-2 gap-3">
              {[{ id: "stripe", icon: "💳", label: "Card / Stripe" }, { id: "cash_on_delivery", icon: "💵", label: "Cash on delivery" }].map((m) => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${paymentMethod === m.id ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <span className="text-2xl block mb-1">{m.icon}</span>
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>
            {paymentMethod === "stripe" && (
              <p className="text-xs text-gray-400 mt-3">You'll be charged ${total.toFixed(2)} when the order is confirmed.</p>
            )}
          </div>
        </div>

        {/* ── Right: summary + place order ── */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card p-6 sticky top-20 space-y-4">
            <h2 className="font-bold text-lg">Order summary</h2>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {cart.items?.map((item) => (
                <div key={item._id} className="flex justify-between"><span>{item.name} ×{item.quantity}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <button onClick={placeOrder} disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Placing order..." : `Place order — $${total.toFixed(2)}`}
            </button>
            <p className="text-xs text-gray-400 text-center">By placing your order you agree to our terms of service.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

