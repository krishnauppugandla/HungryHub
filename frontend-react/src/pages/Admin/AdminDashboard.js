import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { API } from "../../constants/api";
import { OrderStatusBadge } from "../../shared/components/UIElements/Badge";
import { Skeleton } from "../../shared/components/UIElements/Skeleton";
import toast from "react-hot-toast";

const TABS = ["Overview", "Users", "Restaurants", "Orders"];

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = "text-gray-900" }) => (
  <div className="card p-5">
    <p className="text-2xl mb-2">{icon}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ── Overview tab ──────────────────────────────────────────────────────────────
const OverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API.ADMIN_STATS)
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
  );
  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon="💰" label="Total revenue" value={`$${(stats.totalRevenue || 0).toFixed(2)}`} color="text-green-600" />
        <StatCard icon="📦" label="Total orders" value={stats.totalOrders || 0} />
        <StatCard icon="👥" label="Total users" value={(stats.customerCount || 0) + (stats.sellerCount || 0)}
          sub={`${stats.customerCount || 0} customers · ${stats.sellerCount || 0} sellers`} />
        <StatCard icon="🏪" label="Active restaurants" value={stats.activeRestaurants || 0} />
        <StatCard icon="📊" label="Today's orders" value={stats.todayOrders || 0} />
        <StatCard icon="🎯" label="Today's revenue" value={`$${(stats.todayRevenue || 0).toFixed(2)}`}
          sub={`${stats.todayOrders || 0} orders today`} />
      </div>

      {stats.recentOrders?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Recent orders</h3>
          <div className="space-y-2">
            {stats.recentOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">#{order._id.slice(-6).toUpperCase()}</span>
                <span className="text-gray-500">{order.restaurant?.name}</span>
                <OrderStatusBadge status={order.status} />
                <span className="font-medium">${order.totalAmount?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Users tab ─────────────────────────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get(API.ADMIN_USERS, { params });
      setUsers(data.data.users || []);
      setTotalPages(data.data.pagination?.pages || 1);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const handleToggleSuspend = async (userId, isActive) => {
    try {
      await api.patch(API.ADMIN_SUSPEND_USER(userId), { isActive: !isActive });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? "User suspended" : "User reactivated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-32">
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <>
          <div className="card overflow-hidden">
            {users.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No users found</p>
            ) : (
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize hidden sm:block">
                      {user.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {user.isActive ? "Active" : "Suspended"}
                    </span>
                    {user.role !== "admin" && (
                      <button
                        onClick={() => handleToggleSuspend(user._id, user.isActive)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          user.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {user.isActive ? "Suspend" : "Activate"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Previous</button>
              <span className="flex items-center px-3 text-sm text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Restaurants tab ───────────────────────────────────────────────────────────
const RestaurantsTab = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API.ADMIN_RESTAURANTS)
      .then(({ data }) => setRestaurants(data.data.restaurants || []))
      .catch(() => toast.error("Failed to load restaurants"))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFeatured = async (id, isFeatured) => {
    try {
      await api.patch(API.ADMIN_FEATURE_REST(id), { isFeatured: !isFeatured });
      setRestaurants((prev) => prev.map((r) => r._id === id ? { ...r, isFeatured: !isFeatured } : r));
      toast.success(isFeatured ? "Removed from featured" : "Added to featured");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.patch(API.ADMIN_ACTIVATE_REST(id), { isActive: !isActive });
      setRestaurants((prev) => prev.map((r) => r._id === id ? { ...r, isActive: !isActive } : r));
      toast.success(isActive ? "Restaurant suspended" : "Restaurant activated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  return (
    <div className="card overflow-hidden">
      {restaurants.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">No restaurants found</p>
      ) : (
        <div className="divide-y">
          {restaurants.map((rest) => (
            <div key={rest._id} className="flex items-center gap-3 p-4">
              {rest.image ? (
                <img src={rest.image} alt={rest.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🏪</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{rest.name}</p>
                  {rest.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">⭐ Featured</span>}
                </div>
                <p className="text-xs text-gray-500">{rest.address?.city} · ⭐ {rest.averageRating?.toFixed(1) || "—"}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${rest.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {rest.isActive ? "Active" : "Suspended"}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleToggleFeatured(rest._id, rest.isFeatured)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    rest.isFeatured ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {rest.isFeatured ? "Unfeature" : "Feature"}
                </button>
                <button
                  onClick={() => handleToggleActive(rest._id, rest.isActive)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    rest.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  {rest.isActive ? "Suspend" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Orders tab ────────────────────────────────────────────────────────────────
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get(API.ADMIN_ORDERS, { params });
      setOrders(data.data.orders || []);
      setTotalPages(data.data.pagination?.pages || 1);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const handleOverrideStatus = async (orderId, newStatus) => {
    try {
      await api.patch(API.ADMIN_ORDER_STATUS(orderId), { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status set to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const ALL_STATUSES = ["Pending", "Accepted", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

  return (
    <div>
      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-48">
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <>
          <div className="card overflow-hidden">
            {orders.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No orders found</p>
            ) : (
              <div className="divide-y">
                {orders.map((order) => (
                  <div key={order._id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{order.user?.name} → {order.restaurant?.name}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <span className="font-semibold text-sm">${order.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {ALL_STATUSES.filter((s) => s !== order.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleOverrideStatus(order._id, s)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Previous</button>
              <span className="flex items-center px-3 text-sm text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [tab, setTab] = useState("Overview");

  return (
    <div className="page-container py-6">
      <h1 className="text-2xl font-bold mb-6">Admin dashboard</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab />}
      {tab === "Users" && <UsersTab />}
      {tab === "Restaurants" && <RestaurantsTab />}
      {tab === "Orders" && <OrdersTab />}
    </div>
  );
};

export default AdminDashboard;

