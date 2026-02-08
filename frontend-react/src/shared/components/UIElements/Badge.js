import React from "react";

const colors = {
  green:  "bg-green-100 text-green-700",
  red:    "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue:   "bg-blue-100 text-blue-700",
  gray:   "bg-gray-100 text-gray-600",
  orange: "bg-orange-100 text-orange-700",
};

const statusColorMap = {
  "Pending":          "yellow",
  "Accepted":         "blue",
  "Preparing":        "orange",
  "Out for Delivery": "blue",
  "Delivered":        "green",
  "Cancelled":        "red",
};

const Badge = ({ label, color = "gray", className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.gray} ${className}`}>
    {label}
  </span>
);

export const OrderStatusBadge = ({ status }) => (
  <Badge label={status} color={statusColorMap[status] || "gray"} />
);

export default Badge;
