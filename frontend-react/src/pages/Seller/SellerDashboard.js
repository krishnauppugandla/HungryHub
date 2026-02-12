import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { API } from "../../constants/api";
import useSocket from "../../hooks/useSocket";
import { OrderStatusBadge } from "../../shared/components/UIElements/Badge";
import { Skeleton } from "../../shared/components/UIElements/Skeleton";
import EmptyState from "../../shared/components/UIElements/EmptyState";
import toast from "react-hot-toast";

const NEXT_STATUS = {
  Pending: "Accepted",
  Accepted: "Preparing",
  Preparing: "Out for Delivery",
  "Out for Delivery": "Delivered",
};

const ACTIVE_STATUSES = ["Pending", "Accepted", "Preparing", "Out for Delivery"];
const TABS = ["Overview", "Orders", "Menu", "Settings"];

const OrderRow = ({ order, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(false);
  const nextStatus = NEXT_STATUS[order.status];

  const handleUpdate = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await onUpdateStatus(order._id, nextStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    setUpdating(true);
    try {
      await onUpdateStatus(order._id, "Cancelled");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-sm">#{order._id.slice(-6).toUpperCase()}</p>
          <p className="text-xs text-gray-500">{order.user?.name || "Customer"}</p>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="text-xs text-gray-600 mb-3 space-y-0.5">
        {order.items?.map((item, i) => (
          <p key={i}>{item.name} ×{item.quantity}</p>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm">${order.totalAmount?.toFixed(2)}</span>
        <div className="flex gap-2">
          {order.status === "Pending" && (
            <button
              onClick={handleCancel}
              disabled={updating}
              className="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          {nextStatus && (
            <button onClick={handleUpdate} disabled={updating} className="btn-primary text-xs px-3 py-1.5">
              {updating ? "..." : `Mark ${nextStatus}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuItemRow = ({ item, onToggle, onDelete }) => (
  <div className="flex items-center gap-3 py-3 border-b last:border-0">
    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />}
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm truncate">{item.name}</p>
      <p className="text-xs text-gray-500">{item.category} · ${item.price?.toFixed(2)}</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle(item._id, !item.isAvailable)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          item.isAvailable ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          item.isAvailable ? "translate-x-4" : "translate-x-1"
        }`} />
      </button>
      <button onClick={() => onDelete(item._id)} className="text-gray-300 hover:text-red-400 ml-1 text-lg leading-none">
        ×
      </button>
    </div>
  </div>
);

const CATEGORIES = [
  "Appetizer", "Main", "Side", "Dessert", "Beverage",
  "Breakfast", "Lunch", "Dinner", "Snack", "Pizza", "Burger", "Sushi", "Other",
];

const AddMenuItemForm = ({ restaurantId, onAdded, onCancel }) => {
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "Main",
    calories: "", isVegetarian: false, isVegan: false, isSpicy: false, isGlutenFree: false,
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [e.target.name]: val }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), restaurant: restaurantId };
      if (form.calories) payload.calories = parseInt(form.calories);
      const { data } = await api.post(API.MENU_ITEMS, payload);
      onAdded(data.data);
      toast.success("Item added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 border-t pt-4 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <input name="name" placeholder="Item name*" value={form.name} onChange={handle} required className="input-field col-span-2" />
        <input name="description" placeholder="Description" value={form.description} onChange={handle} className="input-field col-span-2" />
        <input name="price" type="number" step="0.01" min="0" placeholder="Price*" value={form.price} onChange={handle} required className="input-field" />
        <select name="category" value={form.category} onChange={handle} className="input-field">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input name="calories" type="number" placeholder="Calories (optional)" value={form.calories} onChange={handle} className="input-field" />
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        {[["isVegetarian", "Vegetarian"], ["isVegan", "Vegan"], ["isSpicy", "Spicy"], ["isGlutenFree", "Gluten-Free"]].map(([key, label]) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" name={key} checked={form[key]} onChange={handle} className="rounded text-red-500" />
            {label}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? "Adding..." : "Add item"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </form>
  );
};

const SellerDashboard = () => {
  const [tab, setTab] = useState("Overview");
  const [restaurant, setRestaurant] = useState(null);
  const [loadingRest, setLoadingRest] = useState(true);

  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  const [earnings, setEarnings] = useState({ today: 0, total: 0, ordersToday: 0, totalOrders: 0 });
  const [toggling, setToggling] = useState(false);

  const { joinRestaurantRoom, onNewOrder } = useSocket();

  useEffect(() => {
    api.get(API.MY_RESTAURANT)
      .then(({ data }) => setRestaurant(data.data.restaurant))
      .catch(() => {})
      .finally(() => setLoadingRest(false));
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!restaurant) return;
    setLoadingOrders(true);
    try {
      const { data } = await api.get(API.RESTAURANT_ORDERS, {
        params: { status: ACTIVE_STATUSES.join(","), limit: 50 },
      });
      setActiveOrders(data.data || []);
    } catch {} finally {
      setLoadingOrders(false);
    }
  }, [restaurant]);

  const fetchMenu = useCallback(async () => {
    if (!restaurant) return;
    setLoadingMenu(true);
    try {
      const { data } = await api.get(API.MENU_BY_RESTAURANT(restaurant._id));
      setMenuItems(data.data.items || []);
    } catch {} finally {
      setLoadingMenu(false);
    }
  }, [restaurant]);

  const fetchStats = useCallback(async () => {
    if (!restaurant) return;
    try {
      const { data } = await api.get(API.RESTAURANT_ORDERS, { params: { limit: 1000 } });
      const orders = data.data || [];
      const today = new Date().toDateString();
      const todayOrders = orders.filter(
        (o) => new Date(o.createdAt).toDateString() === today && o.status !== "Cancelled"
      );
      setEarnings({
        today: todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
        ordersToday: todayOrders.length,
        total: orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + (o.totalAmount || 0), 0),
        totalOrders: orders.filter((o) => o.status !== "Cancelled").length,
      });
    } catch {}
  }, [restaurant]);

  useEffect(() => {
    if (tab === "Orders") fetchOrders();
    if (tab === "Menu") fetchMenu();
    if (tab === "Overview") fetchStats();
  }, [tab, fetchOrders, fetchMenu, fetchStats]);

  useEffect(() => {
    if (!restaurant) return;
    joinRestaurantRoom(restaurant._id);
    const unsub = onNewOrder((newOrder) => {
      toast.success(`New order #${newOrder._id?.slice(-6).toUpperCase() || ""}!`);
      if (tab === "Orders") {
        setActiveOrders((prev) => [newOrder, ...prev]);
      }
    });
    return unsub;
  }, [restaurant, joinRestaurantRoom, onNewOrder, tab]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await api.patch(API.ORDER_STATUS(orderId), { status: newStatus });
      if (newStatus === "Cancelled" || newStatus === "Delivered") {
        setActiveOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        setActiveOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
      toast.success(`Order marked as ${newStatus}`);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleToggleOpen = async () => {
    setToggling(true);
    try {
      const { data } = await api.patch(API.TOGGLE_OPEN(restaurant._id));
      const updated = data.data.restaurant || data.data;
      setRestaurant((p) => ({ ...p, isOpen: updated.isOpen }));
      toast.success(updated.isOpen ? "Restaurant is now open" : "Restaurant is now closed");
    } catch {
      toast.error("Failed to toggle status");
    } finally {
      setToggling(false);
    }
  };

  const handleToggleAvailability = async (itemId, isAvailable) => {
    try {
      await api.patch(API.MENU_AVAILABILITY(itemId), { isAvailable });
      setMenuItems((prev) => prev.map((m) => (m._id === itemId ? { ...m, isAvailable } : m)));
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(API.MENU_ITEM(itemId));
      setMenuItems((prev) => prev.filter((m) => m._id !== itemId));
      toast.success("Item removed");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  if (loadingRest) {
    return (
      <div className="page-container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-32 rounded-2xl mb-4" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="page-container py-8">
        <EmptyState
          icon="🏪"
          title="No restaurant yet"
          message="Set up your restaurant to start receiving orders."
          action={<button className="btn-primary" onClick={() => setTab("Settings")}>Create restaurant</button>}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-gray-500 text-sm">{restaurant.address?.city}, {restaurant.address?.state}</p>
        </div>
        <button
          onClick={handleToggleOpen}
          disabled={toggling}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
            restaurant.isOpen
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${restaurant.isOpen ? "bg-green-500" : "bg-gray-400"}`} />
          {restaurant.isOpen ? "Open" : "Closed"}
        </button>
      </div>

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
            {t === "Orders" && activeOrders.length > 0 && tab !== "Orders" && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Today's earnings", value: `$${earnings.today.toFixed(2)}`, icon: "💰" },
              { label: "Orders today", value: earnings.ordersToday, icon: "📦" },
              { label: "Total earnings", value: `$${earnings.total.toFixed(2)}`, icon: "📈" },
              { label: "Total orders", value: earnings.totalOrders, icon: "✅" },
            ].map((stat) => (
              <div key={stat.label} className="card p-5">
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Restaurant info</h3>
            <div className="space-y-1.5 text-sm text-gray-600">
              <p>📞 {restaurant.phone}</p>
              <p>📍 {restaurant.address?.street}, {restaurant.address?.city}</p>
              <p>⏱️ ~{restaurant.estimatedDeliveryTime} min delivery</p>
              <p>🚗 ${restaurant.deliveryFee?.toFixed(2)} delivery fee</p>
              <p>⭐ {restaurant.averageRating?.toFixed(1) || "—"} ({restaurant.totalReviews || 0} reviews)</p>
            </div>
          </div>
        </div>
      )}

      {tab === "Orders" && (
        <div>
          <h2 className="font-semibold mb-4">Active orders</h2>
          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
            </div>
          ) : activeOrders.length === 0 ? (
            <EmptyState icon="🎉" title="No active orders" message="New orders will appear here in real time." />
          ) : (
            activeOrders.map((order) => (
              <OrderRow key={order._id} order={order} onUpdateStatus={handleUpdateStatus} />
            ))
          )}
        </div>
      )}

      {tab === "Menu" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Menu ({menuItems.length} items)</h2>
            <button onClick={() => setShowAddItem((v) => !v)} className="btn-primary text-sm">
              {showAddItem ? "Cancel" : "+ Add item"}
            </button>
          </div>
          {showAddItem && (
            <div className="card p-5 mb-4">
              <AddMenuItemForm
                restaurantId={restaurant._id}
                onAdded={(item) => { setMenuItems((p) => [...p, item]); setShowAddItem(false); }}
                onCancel={() => setShowAddItem(false)}
              />
            </div>
          )}
          {loadingMenu ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : menuItems.length === 0 ? (
            <EmptyState icon="🍽️" title="No menu items yet" message="Add items so customers can order from you." />
          ) : (
            <div className="card p-5">
              {menuItems.map((item) => (
                <MenuItemRow
                  key={item._id}
                  item={item}
                  onToggle={handleToggleAvailability}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Settings" && (
        <SellerSettings restaurant={restaurant} onUpdated={setRestaurant} />
      )}
    </div>
  );
};

const CUISINE_OPTIONS = [
  "American", "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai",
  "Mediterranean", "Fast Food", "Pizza", "Burgers", "Sushi", "Korean", "Vietnamese",
  "Greek", "Middle Eastern", "French", "Spanish", "Brazilian", "Caribbean",
  "African", "Fusion", "Vegan", "Seafood",
];

const SellerSettings = ({ restaurant, onUpdated }) => {
  const [form, setForm] = useState({
    name: restaurant.name || "",
    description: restaurant.description || "",
    phone: restaurant.phone || "",
    deliveryFee: restaurant.deliveryFee || 2.99,
    minimumOrder: restaurant.minimumOrder || 10,
    estimatedDeliveryTime: restaurant.estimatedDeliveryTime || 35,
    cuisineType: restaurant.cuisineType || [],
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const toggleCuisine = (c) => {
    setForm((p) => ({
      ...p,
      cuisineType: p.cuisineType.includes(c)
        ? p.cuisineType.filter((x) => x !== c)
        : p.cuisineType.length < 3
        ? [...p.cuisineType, c]
        : p.cuisineType,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch(API.RESTAURANT(restaurant._id), form);
      onUpdated(data.data.restaurant || data.data);
      toast.success("Restaurant updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update restaurant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold">Restaurant details</h3>
        <input name="name" placeholder="Restaurant name*" value={form.name} onChange={handle} required className="input-field" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handle} rows={3} className="input-field resize-none" />
        <input name="phone" placeholder="Phone number*" value={form.phone} onChange={handle} required className="input-field" />
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold">Delivery settings</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Delivery fee ($)</label>
            <input name="deliveryFee" type="number" step="0.01" min="0" value={form.deliveryFee} onChange={handle} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min order ($)</label>
            <input name="minimumOrder" type="number" min="0" value={form.minimumOrder} onChange={handle} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Est. time (min)</label>
            <input name="estimatedDeliveryTime" type="number" min="5" value={form.estimatedDeliveryTime} onChange={handle} className="input-field" />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-3">
          Cuisine types <span className="text-gray-400 font-normal text-xs">(pick up to 3)</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCuisine(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                form.cuisineType.includes(c)
                  ? "bg-red-500 text-white border-red-500"
                  : "border-gray-200 text-gray-600 hover:border-red-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
};

export default SellerDashboard;

