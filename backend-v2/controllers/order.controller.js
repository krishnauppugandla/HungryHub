const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const PromoCode = require("../models/PromoCode");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/apiResponse");

// POST /api/orders
const createOrder = asyncHandler(async (req, res, next) => {
  const { deliveryAddress, phone, deliveryInstructions, paymentMethod } = req.body;

  if (!deliveryAddress || !phone) {
    return next(new AppError("Delivery address and phone are required.", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.menuItem");
  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty.", 400));
  }

  const restaurant = await Restaurant.findById(cart.restaurant);
  if (!restaurant || !restaurant.isActive) {
    return next(new AppError("Restaurant is not available.", 400));
  }

  // Build order items from cart
  const items = cart.items.map((ci) => ({
    menuItem: ci.menuItem._id,
    name: ci.name || ci.menuItem.name,
    price: ci.price || ci.menuItem.price,
    quantity: ci.quantity,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = restaurant.deliveryFee || 2.99;

  // Use the promo/discount already applied to the cart
  let discount = cart.discount || 0;
  let appliedPromo = cart.promoCode || null;

  // If there's a promoCode on the cart, mark it as used
  if (appliedPromo) {
    const promo = await PromoCode.findOne({ code: appliedPromo, isActive: true });
    if (promo) {
      await PromoCode.findByIdAndUpdate(promo._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: req.user._id },
      });
    }
  }

  const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

  const order = await Order.create({
    user: req.user._id,
    restaurant: restaurant._id,
    items,
    subtotal,
    deliveryFee,
    discount,
    totalAmount,
    deliveryAddress,
    phone,
    deliveryInstructions,
    paymentMethod: paymentMethod || "card",
    promoCode: appliedPromo,
    estimatedDeliveryTime: restaurant.estimatedDeliveryTime || 35,
  });

  // Clear cart
  await Cart.findByIdAndDelete(cart._id);

  // Notify seller via socket
  if (req.io) {
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name phone")
      .populate("restaurant", "name");
    req.io.to(`restaurant-${restaurant._id}`).emit("new-order", populatedOrder);
  }

  created(res, order, "Order placed successfully");
});

// GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user._id };

  if (status) {
    const statuses = status.split(",").map((s) => s.trim()).filter(Boolean);
    filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("restaurant", "name image cuisineType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(filter),
  ]);

  success(res, {
    orders,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// GET /api/orders/restaurant  (seller)
const getRestaurantOrders = asyncHandler(async (req, res, next) => {
  const { status, limit = 50 } = req.query;

  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) return next(new AppError("No restaurant found.", 404));

  const filter = { restaurant: restaurant._id };
  if (status) {
    const statuses = status.split(",").map((s) => s.trim()).filter(Boolean);
    filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }

  const orders = await Order.find(filter)
    .populate("user", "name phone")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  success(res, orders);
});

// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("restaurant", "name phone address");

  if (!order) return next(new AppError("Order not found.", 404));

  const userId = req.user._id.toString();
  const isOwner = order.user?._id?.toString() === userId;
  const isAdmin = req.user.role === "admin";

  // Check if seller owns the restaurant
  let isSeller = false;
  if (req.user.role === "seller") {
    const rest = await Restaurant.findOne({ owner: req.user._id, _id: order.restaurant?._id });
    isSeller = !!rest;
  }

  if (!isOwner && !isAdmin && !isSeller) {
    return next(new AppError("You do not have permission to view this order.", 403));
  }

  success(res, order);
});

// PATCH /api/orders/:id/status  (seller or admin)
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found.", 404));

  // Sellers can only update their own restaurant's orders
  if (req.user.role === "seller") {
    const rest = await Restaurant.findOne({ owner: req.user._id, _id: order.restaurant });
    if (!rest) return next(new AppError("Not authorized to update this order.", 403));
  }

  order.status = status;
  await order.save();

  // Notify customer via socket
  if (req.io) {
    req.io.to(`order-${order._id}`).emit("order-status-update", {
      orderId: order._id,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
    });
  }

  success(res, order, `Order status updated to ${status}`);
});

// POST /api/orders/:id/reorder
const reorder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found.", 404));
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized.", 403));
  }

  const restaurant = await Restaurant.findById(order.restaurant);
  if (!restaurant || !restaurant.isActive) {
    return next(new AppError("This restaurant is no longer available.", 400));
  }

  // Build new cart items from the order
  const cartItems = order.items.map((item) => ({
    menuItem: item.menuItem,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, restaurant: order.restaurant, items: cartItems },
    { upsert: true, new: true }
  );

  success(res, null, "Items added to cart");
});

module.exports = { createOrder, getMyOrders, getRestaurantOrders, getOrder, updateOrderStatus, reorder };
