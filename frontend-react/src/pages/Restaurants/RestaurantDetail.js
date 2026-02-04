import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { API } from "../../constants/api";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import StarRating from "../../shared/components/UIElements/StarRating";
import { MenuItemSkeleton } from "../../shared/components/UIElements/Skeleton";
import toast from "react-hot-toast";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({ items: [], grouped: {} });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rRes, mRes, revRes] = await Promise.all([
          api.get(API.RESTAURANT(id)),
          api.get(API.MENU_BY_RESTAURANT(id)),
          api.get(API.RESTAURANT_REVIEWS(id)),
        ]);
        setRestaurant(rRes.data.data.restaurant || rRes.data.data);

        const items = mRes.data.data.items || [];
        const grouped = items.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});
        setMenu({ items, grouped });
        setReviews(revRes.data.data.reviews || []);

        const cats = Object.keys(grouped);
        if (cats.length) setActiveCategory(cats[0]);
      } catch {
        navigate("/restaurants");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleAdd = async (item) => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "customer") { toast.error("Only customers can add items to cart."); return; }
    setAddingId(item._id);
    await addToCart(item._id, restaurant._id);
    setAddingId(null);
  };

  if (loading) return (
    <div className="page-container py-8">
      <div className="skeleton h-64 w-full rounded-2xl mb-6" />
      <div className="space-y-3">{Array(4).fill(0).map((_, i) => <MenuItemSkeleton key={i} />)}</div>
    </div>
  );

  if (!restaurant) return null;

  const categories = Object.keys(menu.grouped);

  return (
    <div className="animate-fade-in">
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{restaurant.name}</h1>
          <p className="text-sm text-gray-300">{restaurant.cuisineType?.join(", ")}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <StarRating rating={restaurant.averageRating} count={restaurant.totalReviews} />
            <span>⏱ {restaurant.estimatedDeliveryTime} min</span>
            <span>${restaurant.deliveryFee?.toFixed(2)} delivery</span>
            <span className={`font-semibold ${restaurant.isOpen ? "text-green-400" : "text-red-400"}`}>
              {restaurant.isOpen ? "● Open" : "● Closed"}
            </span>
          </div>
        </div>
      </div>

      <div className="page-container py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                      activeCategory === cat
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {(menu.grouped[activeCategory] || []).map((item) => (
                <div key={item._id} className="card p-4 flex gap-4 items-center hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-red-500 font-bold">${item.price.toFixed(2)}</span>
                      <span className="flex gap-1">
                        {item.isVegetarian && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">🌿 Veg</span>
                        )}
                        {item.isSpicy && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🌶️ Spicy</span>
                        )}
                      </span>
                    </div>
                  </div>
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-24 h-20 object-cover rounded-xl flex-shrink-0" />
                  )}
                  {restaurant.isOpen && user?.role === "customer" && (
                    <button
                      onClick={() => handleAdd(item)}
                      disabled={addingId === item._id || !item.isAvailable}
                      className="btn-primary text-sm px-4 py-2 flex-shrink-0 disabled:opacity-50"
                    >
                      {addingId === item._id ? "Adding..." : !item.isAvailable ? "Sold out" : "+ Add"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-72 space-y-4 flex-shrink-0">
            <div className="card p-5">
              <h3 className="font-semibold mb-3">Restaurant info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📍 {restaurant.address?.street}, {restaurant.address?.city}</p>
                <p>📞 {restaurant.phone}</p>
                <p>🛵 Min. order: ${restaurant.minimumOrder}</p>
                {restaurant.description && <p className="text-gray-500 mt-2">{restaurant.description}</p>}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold mb-3">Reviews</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-gray-50 pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xs font-bold">
                          {r.user?.name?.[0]}
                        </div>
                        <span className="text-sm font-medium">{r.user?.name}</span>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      {r.comment && <p className="text-xs text-gray-500 pl-9">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
