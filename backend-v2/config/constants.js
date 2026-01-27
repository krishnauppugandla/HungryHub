const ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
};

const ORDER_STATUSES = [
  "Pending",
  "Accepted",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

module.exports = { ROLES, ORDER_STATUSES };
