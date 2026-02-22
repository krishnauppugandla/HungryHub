import React from "react";
import Card from "../../shared/components/UIElements/Card";
import "./OrderItem.css";

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const OrderItem = ({ order }) => {
  const total = (order.items || []).reduce(
    (sum, item) => sum + (item.menuItem?.price || 0) * item.quantity,
    0
  );
  const status = order.status || "pending";

  return (
    <Card className="order-item">
      <div className="order-item__header">
        <div>
          <span className="order-item__id">Order #{order._id.slice(-6).toUpperCase()}</span>
          <p className="order-item__meta">📍 {order.address} &nbsp;|&nbsp; 📞 {order.phone}</p>
        </div>
        <span className="order-item__status" style={{ color: STATUS_COLORS[status] }}>
          {status}
        </span>
      </div>

      <div className="order-item__lines">
        {(order.items || []).map((item, idx) => (
          <div key={idx} className="order-item__line">
            <span>{item.menuItem?.name || "Item"}</span>
            <span>
              ₹{item.menuItem?.price} × {item.quantity} ={" "}
              <strong>₹{(item.menuItem?.price || 0) * item.quantity}</strong>
            </span>
          </div>
        ))}
      </div>

      <div className="order-item__total">Total: ₹{total}</div>
    </Card>
  );
};

export default OrderItem;
