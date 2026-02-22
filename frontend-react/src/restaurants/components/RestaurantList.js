import React from "react";
import RestaurantItem from "./RestaurantItem";
import "./RestaurantList.css";

const RestaurantList = ({ restaurants, onSelect }) => {
  if (restaurants.length === 0) {
    return <p className="empty-state">No restaurants available yet.</p>;
  }

  return (
    <div className="restaurant-list">
      {restaurants.map((restaurant) => (
        <RestaurantItem key={restaurant._id} restaurant={restaurant} onSelect={onSelect} />
      ))}
    </div>
  );
};

export default RestaurantList;
