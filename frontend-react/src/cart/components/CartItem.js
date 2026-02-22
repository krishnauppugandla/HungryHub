import React from "react";
import Card from "../../shared/components/UIElements/Card";
import "./CartItem.css";

const CartItem = ({ item }) => {
  const price = item.menuItem?.price || 0;
  const subtotal = price * item.quantity;

  return (
    <Card className="cart-item">
      <div className="cart-item__info">
        <h3>{item.menuItem?.name || "Unknown Item"}</h3>
        <p>₹{price} × {item.quantity}</p>
      </div>
      <div className="cart-item__subtotal">₹{subtotal}</div>
    </Card>
  );
};

export default CartItem;
