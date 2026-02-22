import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuList from "../components/MenuList";
import AddMenuItemForm from "../components/AddMenuItemForm";
import Button from "../../shared/components/FormElements/Button";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Alert from "../../shared/components/UIElements/Alert";
import api from "../../api";

const MenuItems = () => {
  const { restaurantName } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [addedItems, setAddedItems] = useState({});

  const fetchMenuItems = async () => {
    try {
      const res = await api.get(`/restaurants/${restaurantName}/${user._id}/menuitems`);
      setMenuItems(res.data);
    } catch {
      setError("Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = async (item) => {
    try {
      await api.post("/cart", { user: user._id, menuItem: item._id, quantity: 1 });
      setAddedItems((prev) => ({ ...prev, [item._id]: true }));
      setTimeout(() => setAddedItems((prev) => ({ ...prev, [item._id]: false })), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to cart.");
    }
  };

  if (loading) return <LoadingSpinner message="Loading menu..." />;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Button variant="outline" size="sm" onClick={() => navigate("/restaurants")}>
            ← Back
          </Button>
          <h2>{restaurantName} — Menu</h2>
        </div>
        {user?.role === "owner" && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Item"}
          </Button>
        )}
      </div>

      <Alert message={error} />

      {showForm && (
        <AddMenuItemForm
          restaurantName={restaurantName}
          onAdded={() => { setShowForm(false); fetchMenuItems(); }}
        />
      )}

      <MenuList
        items={menuItems}
        onAddToCart={handleAddToCart}
        addedItems={addedItems}
        isCustomer={user?.role === "customer"}
      />
    </div>
  );
};

export default MenuItems;
