import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { API } from "../../constants/api";
import useSocket from "../../hooks/useSocket";
import toast from "react-hot-toast";

const STATUS_STEPS = ["Pending", "Accepted", "Preparing", "Out for Delivery", "Delivered"];
const STATUS_ICONS = { "Pending": "🕐", "Accepted": "✅", "Preparing": "👨‍🍳", "Out for Delivery": "🚴", "Delivered": "🏠", "Cancelled": "❌" };

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { joinOrderRoom, onOrderStatusUpdate } = useSocket();

  useEffect(() => {
    api.get(API.ORDER(id)).then(({ data }) => { setOrder(data.data); }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // Join socket room for real-time updates
  useEffect(() => {
    if (!id) return;
    joinOrderRoom(id);
    const unsub = onOrderStatusUpdate((payload) => {
      setOrder((prev) => prev ? { ...prev, status: payload.status } : prev);
      toast.success(`Order is now: ${payload.status} ${STATUS_ICONS[payload.status] || ""}`);
    });
    return unsub;
  }, [id, joinOrderRoom, onOrderStatusUpdate]);

  if (loading) return (
    <div className="page-container py-10 flex justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="page-container py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Order tracking</h1>
      <p className="text-gray-500 text-sm mb-6">Order #{order._id.slice(-6).toUpperCase()}</p>

      {/* Status banner */}
      <div className={`card p-6 mb-6 text-center ${isCancelled ? "bg-red-50" : "bg-green-50"}`}>
        <div className="text-5xl mb-3">{STATUS_ICONS[order.status] || "📦"}</div>
        <h2 className="text-xl font-bold mb-1">{order.status}</h2>
        {!isCancelled && order.status !== "Delivered" && (
          <p className="text-gray-500 text-sm">Est. delivery in ~{order.estimatedDeliveryTime} min</p>
        )}
        {order.status === "Delivered" && <p className="text-green-600 font-medium text-sm">Enjoy your meal! 😋</p>}
      </div>

      {/* Progress steps */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between relative">
            {/* Progress bar */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0">
              <div className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }} />
            </div>

            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  i < currentStep ? "bg-red-500 border-red-500 text-white" :
                  i === currentStep ? "bg-white border-red-500 text-red-500" :
                  "bg-white border-gray-200 text-gray-300"}`}>
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <span className={`text-xs text-center max-w-12 leading-tight ${i <= currentStep ? "text-gray-700 font-medium" : "text-gray-300"}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map placeholder */}
      <div className="card p-0 overflow-hidden mb-6">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm">Live map tracking</p>
            <p className="text-xs">Available with Google Maps integration</p>
          </div>
        </div>
      </div>

      {/* Order details */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Order details</h3>
        <div className="space-y-2 mb-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.name} ×{item.quantity}</span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Delivery</span><span>${order.deliveryFee?.toFixed(2)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−${order.discount?.toFixed(2)}</span></div>}
          <div className="flex justify-between font-bold"><span>Total</span><span>${order.totalAmount?.toFixed(2)}</span></div>
        </div>
        <div className="border-t pt-3 mt-3 text-sm text-gray-500">
          <p>📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
          <p>📞 {order.phone}</p>
          {order.deliveryInstructions && <p>📝 {order.deliveryInstructions}</p>}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
