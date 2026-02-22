import React from "react";
import MenuItem from "./MenuItem";
import "./MenuList.css";

const MenuList = ({ items, onAddToCart, addedItems, isCustomer }) => {
  if (items.length === 0) {
    return <p className="empty-state">No menu items yet.</p>;
  }

  return (
    <div className="menu-list">
      {items.map((item) => (
        <MenuItem
          key={item._id}
          item={item}
          onAddToCart={onAddToCart}
          added={!!addedItems[item._id]}
          isCustomer={isCustomer}
        />
      ))}
    </div>
  );
};

export default MenuList;
