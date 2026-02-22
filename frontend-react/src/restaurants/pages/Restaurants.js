import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RestaurantList from "../components/RestaurantList";
import AddRestaurantForm from "../components/AddRestaurantForm";
import Button from "../../shared/components/FormElements/Button";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Alert from "../../shared/components/UIElements/Alert";
import api from "../../api";

const Restaurants = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get("/restaurants");
      setRestaurants(res.data);
    } catch {
      setError("Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSelect = (restaurantName) => {
    navigate(`/restaurants/${restaurantName}/menu`);
  };

  const handleAdded = () => {
    setShowForm(false);
    fetchRestaurants();
  };

  if (loading) return <LoadingSpinner message="Loading restaurants..." />;

  return (
    <div>
      <div className="page-header">
        <h2>Restaurants</h2>
        {user?.role === "owner" && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Restaurant"}
          </Button>
        )}
      </div>

      <Alert message={error} />

      {showForm && <AddRestaurantForm onAdded={handleAdded} />}

      <RestaurantList restaurants={restaurants} onSelect={handleSelect} />
    </div>
  );
};

export default Restaurants;
