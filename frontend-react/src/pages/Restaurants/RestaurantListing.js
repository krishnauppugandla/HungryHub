import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { API } from "../../constants/api";
import useDebounce from "../../hooks/useDebounce";
import StarRating from "../../shared/components/UIElements/StarRating";
import { RestaurantCardSkeleton } from "../../shared/components/UIElements/Skeleton";
import EmptyState from "../../shared/components/UIElements/EmptyState";

const CUISINES = ["Pizza","Burgers","Sushi","Italian","Chinese","Mexican","Indian","Thai","American","Sandwiches","Salads","Desserts","Vegan","Seafood"];
const SORTS = [{ value: "-averageRating", label: "Top rated" }, { value: "-createdAt", label: "Newest" }, { value: "deliveryFee", label: "Lowest delivery fee" }, { value: "estimatedDeliveryTime", label: "Fastest delivery" }];

const RestaurantListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || "");
  const [sort, setSort] = useState("-averageRating");
  const [openOnly, setOpenOnly] = useState(false);
  const [page, setPage] = useState(1);

  const dSearch = useDebounce(search, 400);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (dSearch) params.set("search", dSearch);
        if (cuisine) params.set("cuisine", cuisine);
        if (openOnly) params.set("open", "true");
        params.set("sort", sort);
        params.set("page", page);
        params.set("limit", 12);

        const { data } = await api.get(`${API.RESTAURANTS}?${params}`);
        setRestaurants(data.data.restaurants || []);
        setPagination(data.data.pagination || null);
      } catch { setRestaurants([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [dSearch, cuisine, sort, openOnly, page]);

  // sync URL params
  useEffect(() => {
    const p = {};
    if (search) p.search = search;
    if (cuisine) p.cuisine = cuisine;
    setSearchParams(p, { replace: true });
  }, [search, cuisine, setSearchParams]);

  return (
    <div className="page-container py-8">
      {/* ── Search + filters ── */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search restaurants or cuisines..."
            className="input-field pl-9" />
        </div>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="input-field md:w-48">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 whitespace-nowrap cursor-pointer px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
          <input type="checkbox" checked={openOnly} onChange={(e) => { setOpenOnly(e.target.checked); setPage(1); }}
            className="accent-red-500 w-4 h-4" />
          Open now
        </label>
      </div>

      {/* ── Cuisine chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button onClick={() => { setCuisine(""); setPage(1); }}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!cuisine ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-200 hover:border-red-300"}`}>
          All
        </button>
        {CUISINES.map((c) => (
          <button key={c} onClick={() => { setCuisine(cuisine === c ? "" : c); setPage(1); }}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${cuisine === c ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-200 hover:border-red-300"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* ── Results ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <RestaurantCardSkeleton key={i} />)}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState icon="🍽️" title="No restaurants found" message="Try adjusting your search or filters." />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{pagination?.total} restaurants found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {restaurants.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="btn-outline text-sm px-4 py-2 disabled:opacity-40">← Prev</button>
              <span className="flex items-center text-sm text-gray-600 px-3">
                {page} / {pagination.totalPages}
              </span>
              <button disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}
                className="btn-outline text-sm px-4 py-2 disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const RestaurantCard = ({ restaurant }) => (
  <Link to={`/restaurants/${restaurant._id}`} className="card overflow-hidden hover:shadow-md transition-all group animate-fade-in">
    <div className="relative h-44 overflow-hidden rounded-t-2xl">
      <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      {!restaurant.isOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded-full">Closed</span>
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 truncate text-base">{restaurant.name}</h3>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{restaurant.cuisineType?.join(", ")}</p>
      <div className="flex items-center justify-between mt-2">
        <StarRating rating={restaurant.averageRating} count={restaurant.totalReviews} />
        <span className="text-xs text-gray-400 font-medium">{restaurant.estimatedDeliveryTime} min</span>
      </div>
      <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
        <span>{restaurant.priceRange}</span>
        <span>${restaurant.deliveryFee?.toFixed(2)} delivery</span>
      </div>
    </div>
  </Link>
);

export default RestaurantListing;

