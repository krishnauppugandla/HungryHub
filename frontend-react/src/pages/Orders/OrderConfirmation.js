import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { API } from "../../constants/api";

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(API.ORDER(id)).then(({ data }) => setOrder(data.data)).catch(() => {});
  }, [id]);

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="page-container py-16 text-center max-w-lg mx-auto">
      <div className="text-7xl mb-6 animate-bounce">🎉</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order confirmed!</h1>
      <p className="text-gray-500 mb-8">
        Your order #{order._id.slice(-6).toUpperCase()} has been placed. The restaurant is preparing your food now.
      </p>

      <div className="card p-6 text-left mb-6 space-y-3">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Order ID</span><span className="font-mono font-semibold">#{order._id.slice(-6).toUpperCase()}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Total</span><span className="font-semibold">${order.totalAmount?.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Payment</span><span className="font-semibold capitalize">{order.paymentMethod?.replace("_", " ")}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Est. delivery</span><span className="font-semibold">~{order.estimatedDeliveryTime} min</span></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/orders/${order._id}`} className="btn-primary">Track order</Link>
        <Link to="/restaurants" className="btn-outline">Order more</Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
