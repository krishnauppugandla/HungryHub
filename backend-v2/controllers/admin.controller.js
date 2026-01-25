const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    customerCount,
    sellerCount,
    activeRestaurants,
    todayOrdersAgg,
    totalAgg,
  ] = await Promise.all([
    User.countDocuments({ role: "customer", isActive: true }),
    User.countDocuments({ role: "seller", isActive: true }),
    Restaurant.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: { $ne: "Cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
  ]);

  success(res, {
    customerCount,
    sellerCount,
    activeRestaurants,
    todayRevenue: todayOrdersAgg[0]?.revenue || 0,
    todayOrders: todayOrdersAgg[0]?.count || 0,
    totalRevenue: totalAgg[0]?.revenue || 0,
    totalOrders: totalAgg[0]?.count || 0,
  });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) filter.role = role;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  success(res, {
    users,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// PATCH /api/admin/users/:id/suspend
const suspendUser = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError("You cannot suspend your own account.", 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));

  user.isActive = !user.isActive;
  await user.save();

  success(res, { isActive: user.isActive }, user.isActive ? "User account activated" : "User account suspended");
});

// GET /api/admin/restaurants
const getRestaurants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [restaurants, total] = await Promise.all([
    Restaurant.find().populate("owner", "name email").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Restaurant.countDocuments(),
  ]);

  success(res, {
    restaurants,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// PATCH /api/admin/restaurants/:id/feature
const featureRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return next(new AppError("Restaurant not found.", 404));

  restaurant.isFeatured = !restaurant.isFeatured;
  await restaurant.save();

  success(res, restaurant, restaurant.isFeatured ? "Restaurant featured" : "Restaurant unfeatured");
});

// PATCH /api/admin/restaurants/:id/activate
const activateRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return next(new AppError("Restaurant not found.", 404));

  restaurant.isActive = !restaurant.isActive;
  await restaurant.save();

  success(res, restaurant, restaurant.isActive ? "Restaurant activated" : "Restaurant deactivated");
});

// GET /api/admin/orders
const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .populate("restaurant", "name")
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

// PATCH /api/admin/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found.", 404));

  order.status = req.body.status;
  await order.save();

  success(res, order, `Order status updated to ${req.body.status}`);
});

module.exports = {
  getStats,
  getUsers,
  suspendUser,
  getRestaurants,
  featureRestaurant,
  activateRestaurant,
  getOrders,
  updateOrderStatus,
};
