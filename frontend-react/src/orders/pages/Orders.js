import React, { useState, useEffect } from "react";
import OrderItem from "../components/OrderItem";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Alert from "../../shared/components/UIElements/Alert";
import api from "../../api";

const Orders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders/user/${user._id}`);
        setOrders(res.data);
      } catch {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div>
      <div className="page-header">
        <h2>Your Orders</h2>
      </div>

      <Alert message={error} />

      {orders.length === 0 ? (
        <p className="empty-state">You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderItem key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
