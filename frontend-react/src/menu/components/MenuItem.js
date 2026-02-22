import React from "react";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import "./MenuItem.css";

const MenuItem = ({ item, onAddToCart, added, isCustomer }) => {
  return (
    <Card className="menu-item">
      <div className="menu-item__icon">🍴</div>
      <h3 className="menu-item__name">{item.name}</h3>
      <p className="menu-item__price">₹{item.price}</p>
      {isCustomer && (
        <Button
          variant={added ? "success" : "primary"}
          size="sm"
          onClick={() => onAddToCart(item)}
          disabled={added}
        >
          {added ? "✓ Added!" : "Add to Cart"}
        </Button>
      )}
    </Card>
  );
};

export default MenuItem;
