import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { API } from "../../constants/api";
import { OrderStatusBadge } from "../../shared/components/UIElements/Badge";
import { Skeleton } from "../../shared/components/UIElements/Skeleton";
import EmptyState from "../../shared/components/UIElements/EmptyState";
import toast from "react-hot-toast";

const OrderCard = ({ order, onReorder }) => {
  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    setReordering(true);
    try {
      await onReorder(order._id);
    } finally {
      setReordering(false);
    }
  };

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const time = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">{order.restaurant?.name || "Restaurant"}</p>
          <p className="text-xs text-gray-400 mt-0.5">{date} at {time}</p>
          <p className="text-xs text-gray-400">Order #{order._id.slice(-6).toUpperCase()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="border-t border-b py-3 mb-3 space-y-1">
        {order.items?.slice(0, 3).map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.name} ×{item.quantity}</span>
            <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        {order.items?.length > 3 && (
          <p className="text-xs text-gray-400">+{order.items.length - 3} more item{order.items.length - 3 > 1 ? "s" : ""}</p>
        )}
      </div>

      {/* Total & actions */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Total: </span>
          <span className="font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          {(order.status === "Pending" || order.status === "Accepted" || order.status === "Preparing" || order.status === "Out for Delivery") && (
            <Link to={`/orders/${order._id}`} className="btn-outline text-xs px-3 py-1.5">
              Track
            </Link>
          )}
          <button
            onClick={handleReorder}
            disabled={reordering}
            className="btn-primary text-xs px-3 py-1.5"
          >
            {reordering ? "Adding..." : "Reorder"}
          </button>
        </div>
      </div>
    </div>
  );
};

const FILTERS = ["All", "Active", "Delivered", "Cancelled"];

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (filter === "Active") params.status = "Pending,Accepted,Preparing,Out for Delivery";
      else if (filter === "Delivered") params.status = "Delivered";
      else if (filter === "Cancelled") params.status = "Cancelled";

      const { data } = await api.get(API.MY_ORDERS, { params });
      setOrders(data.data.orders || []);
      setTotalPages(data.data.pagination?.pages || 1);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleReorder = async (orderId) => {
    try {
      await api.post(API.REORDER(orderId));
      toast.success("Items added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reorder");
    }
  };

  return (
    <div className="page-container py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Order history</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-red-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-red-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="No orders yet"
          message={filter === "All" ? "Your order history will appear here." : `No ${filter.toLowerCase()} orders found.`}
          action={<Link to="/restaurants" className="btn-primary">Browse restaurants</Link>}
        />
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} onReorder={handleReorder} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistory;
