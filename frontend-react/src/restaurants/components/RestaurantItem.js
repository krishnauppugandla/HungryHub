import React from "react";
import Card from "../../shared/components/UIElements/Card";
import "./RestaurantItem.css";

const RestaurantItem = ({ restaurant, onSelect }) => {
  return (
    <Card className="restaurant-item" onClick={() => onSelect(restaurant.name)}>
      <div className="restaurant-item__icon">🍽️</div>
      <h3 className="restaurant-item__name">{restaurant.name}</h3>
      <p className="restaurant-item__owner">by {restaurant.owner}</p>
      <span className="restaurant-item__cta">View Menu →</span>
    </Card>
  );
};

export default RestaurantItem;
