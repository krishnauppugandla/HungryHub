const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/apiResponse");

// Helper: check restaurant ownership
const checkRestaurantOwnership = async (restaurantId, userId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  if (restaurant.owner.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to manage this restaurant's menu", 403);
  }
  return restaurant;
};

// GET /api/menu-items/restaurant/:id
const getByRestaurant = asyncHandler(async (req, res, next) => {
  const { id: restaurantId } = req.params;

  const items = await MenuItem.find({ restaurant: restaurantId }).sort({
    category: 1,
    name: 1,
  });

  return success(res, { items }, "Menu items fetched successfully");
});

// POST /api/menu-items (seller only)
const create = asyncHandler(async (req, res, next) => {
  const {
    restaurantId, name, description, price, category,
    image, isAvailable, isVegetarian, isVegan, isSpicy, isGlutenFree, calories,
  } = req.body;

  if (!restaurantId) {
    return next(new AppError("restaurantId is required", 400));
  }

  await checkRestaurantOwnership(restaurantId, req.user._id);

  const item = await MenuItem.create({
    restaurant: restaurantId,
    name,
    description,
    price,
    category,
    image,
    isAvailable,
    isVegetarian,
    isVegan,
    isSpicy,
    isGlutenFree,
    calories,
  });

  return created(res, { item }, "Menu item created successfully");
});

// GET /api/menu-items/:id
const getOne = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id).populate(
    "restaurant",
    "name owner"
  );
  if (!item) {
    return next(new AppError("Menu item not found", 404));
  }
  return success(res, { item }, "Menu item fetched successfully");
});

// PATCH /api/menu-items/:id (seller only)
const update = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return next(new AppError("Menu item not found", 404));
  }

  await checkRestaurantOwnership(item.restaurant, req.user._id);

  const allowedFields = [
    "name", "description", "price", "category", "image",
    "isAvailable", "isVegetarian", "isVegan", "isSpicy", "isGlutenFree", "calories",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      item[field] = req.body[field];
    }
  });

  await item.save();

  return success(res, { item }, "Menu item updated successfully");
});

// DELETE /api/menu-items/:id (seller only)
const remove = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return next(new AppError("Menu item not found", 404));
  }

  await checkRestaurantOwnership(item.restaurant, req.user._id);

  await MenuItem.findByIdAndDelete(req.params.id);

  return success(res, null, "Menu item deleted successfully");
});

// PATCH /api/menu-items/:id/availability (seller only)
const toggleAvailability = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return next(new AppError("Menu item not found", 404));
  }

  await checkRestaurantOwnership(item.restaurant, req.user._id);

  // Allow explicit setting or toggle
  if (req.body.isAvailable !== undefined) {
    item.isAvailable = req.body.isAvailable;
  } else {
    item.isAvailable = !item.isAvailable;
  }

  await item.save();

  return success(
    res,
    { item, isAvailable: item.isAvailable },
    `Item is now ${item.isAvailable ? "available" : "unavailable"}`
  );
});

module.exports = { getByRestaurant, create, getOne, update, remove, toggleAvailability };
