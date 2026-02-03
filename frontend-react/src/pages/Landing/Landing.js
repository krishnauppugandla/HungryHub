import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { API } from "../../constants/api";
import StarRating from "../../shared/components/UIElements/StarRating";
import { RestaurantCardSkeleton } from "../../shared/components/UIElements/Skeleton";

const CUISINE_ICONS = {
  "Pizza": "🍕", "Burgers": "🍔", "Sushi": "🍣", "Italian": "🍝",
  "Chinese": "🥡", "Mexican": "🌮", "Indian": "🍛", "Thai": "🍜",
  "American": "🦅", "Sandwiches": "🥪", "Salads": "🥗", "Desserts": "🍰",
};

const Landing = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API.FEATURED)
      .then(({ data }) => setFeatured(data.data.restaurants || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/restaurants${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-br from-red-500 to-red-700 text-white py-20 px-4">
        <div className="page-container text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Food delivered to your <span className="text-yellow-300">door</span>
          </h1>
          <p className="text-red-100 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Order from hundreds of restaurants in your area. Fast, easy, delicious.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants, cuisines..."
              className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-base"
            />
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3.5 rounded-xl transition-colors whitespace-nowrap">
              Find Food
            </button>
          </form>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="page-container">
          <h2 className="text-2xl font-bold mb-6">Browse by cuisine</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.entries(CUISINE_ICONS).map(([name, icon]) => (
              <Link
                key={name}
                to={`/restaurants?cuisine=${name}`}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-red-50 transition-colors group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
                <span className="text-xs font-medium text-gray-600 text-center">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="page-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured restaurants</h2>
            <Link to="/restaurants" className="text-red-500 font-semibold text-sm hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array(4).fill(0).map((_, i) => <RestaurantCardSkeleton key={i} />)
              : featured.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="page-container text-center">
          <h2 className="text-2xl font-bold mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🔍", title: "Browse", desc: "Explore hundreds of restaurants near you" },
              { icon: "🛒", title: "Order", desc: "Add your favourites and checkout in seconds" },
              { icon: "🚀", title: "Delivered", desc: "Fresh food at your door in ~35 minutes" },
            ].map((step) => (
              <div key={step.title} className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-4xl">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-gray-500 text-sm max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-red-500 py-16 text-white text-center px-4">
        <h2 className="text-3xl font-extrabold mb-3">Ready to order?</h2>
        <p className="text-red-100 mb-8">Sign up and get your first delivery free.</p>
        <Link to="/register" className="bg-white text-red-600 font-bold px-8 py-3 rounded-xl hover:bg-red-50 transition-colors inline-block">
          Get started
        </Link>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm">
        <p className="text-white font-bold text-lg mb-2">🍔 HungryHub</p>
        <p>© {new Date().getFullYear()} HungryHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

const RestaurantCard = ({ restaurant }) => (
  <Link to={`/restaurants/${restaurant._id}`} className="card overflow-hidden hover:shadow-md transition-shadow group">
    <div className="relative h-40 overflow-hidden rounded-t-2xl">
      <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      {!restaurant.isOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">Closed</span>
        </div>
      )}
      {restaurant.isFeatured && (
        <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 truncate">{restaurant.name}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{restaurant.cuisineType?.join(", ")}</p>
      <div className="flex items-center justify-between mt-2">
        <StarRating rating={restaurant.averageRating} count={restaurant.totalReviews} />
        <span className="text-xs text-gray-400">{restaurant.estimatedDeliveryTime} min</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">{restaurant.priceRange}</span>
        <span className="text-xs text-gray-400">From ${restaurant.deliveryFee?.toFixed(2)} delivery</span>
      </div>
    </div>
  </Link>
);

export default Landing;
