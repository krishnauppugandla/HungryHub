const Restaurant = require("../models/Restaurant");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/apiResponse");

// GET /api/restaurants
const getRestaurants = asyncHandler(async (req, res, next) => {
  const { search, cuisineType, page = 1, limit = 12 } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { cuisineType: { $regex: search, $options: "i" } },
    ];
  }

  if (cuisineType) {
    const cuisines = cuisineType.split(",").map((c) => c.trim());
    query.cuisineType = { $in: cuisines };
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [restaurants, total] = await Promise.all([
    Restaurant.find(query)
      .sort({ isFeatured: -1, averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("owner", "name email"),
    Restaurant.countDocuments(query),
  ]);

  return success(res, {
    restaurants,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
  }, "Restaurants fetched successfully");
});

// GET /api/restaurants/featured
const getFeatured = asyncHandler(async (req, res, next) => {
  const restaurants = await Restaurant.find({ isActive: true, isFeatured: true })
    .sort({ averageRating: -1 })
    .limit(10)
    .populate("owner", "name");

  return success(res, { restaurants }, "Featured restaurants fetched successfully");
});

// GET /api/restaurants/my (seller's own restaurant)
const getMyRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    return next(new AppError("You don't have a restaurant yet. Create one to get started.", 404));
  }

  return success(res, { restaurant }, "Your restaurant fetched successfully");
});

// GET /api/restaurants/:id
const getRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findOne({
    _id: req.params.id,
    isActive: true,
  }).populate("owner", "name email");

  if (!restaurant) {
    return next(new AppError("Restaurant not found", 404));
  }

  let isFavorite = false;
  if (req.user) {
    isFavorite = req.user.favoriteRestaurants.some(
      (fav) => fav.toString() === restaurant._id.toString()
    );
  }

  return success(res, { restaurant, isFavorite }, "Restaurant fetched successfully");
});

// PATCH /api/restaurants/:id
const updateRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("Restaurant not found", 404));
  }

  // Only the owner can update
  if (restaurant.owner.toString() !== req.user._id.toString()) {
    return next(new AppError("You are not authorized to update this restaurant", 403));
  }

  const allowedFields = [
    "name", "description", "phone", "deliveryFee", "minimumOrder",
    "estimatedDeliveryTime", "cuisineType", "image", "address", "priceRange",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      restaurant[field] = req.body[field];
    }
  });

  await restaurant.save();

  return success(res, { restaurant }, "Restaurant updated successfully");
});

// PATCH /api/restaurants/:id/toggle-open
const toggleOpen = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("Restaurant not found", 404));
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    return next(new AppError("You are not authorized to update this restaurant", 403));
  }

  restaurant.isOpen = !restaurant.isOpen;
  await restaurant.save();

  return success(
    res,
    { restaurant, isOpen: restaurant.isOpen },
    `Restaurant is now ${restaurant.isOpen ? "open" : "closed"}`
  );
});

// POST /api/restaurants (create — seller only)
const createRestaurant = asyncHandler(async (req, res, next) => {
  // Check if seller already has a restaurant
  const existing = await Restaurant.findOne({ owner: req.user._id });
  if (existing) {
    return next(new AppError("You already have a restaurant. You can only manage one restaurant.", 400));
  }

  const {
    name, description, phone, cuisineType, address,
    deliveryFee, minimumOrder, estimatedDeliveryTime, priceRange, image,
  } = req.body;

  if (!name) {
    return next(new AppError("Restaurant name is required", 400));
  }

  const restaurant = await Restaurant.create({
    name,
    description,
    phone,
    cuisineType: cuisineType || [],
    address,
    deliveryFee,
    minimumOrder,
    estimatedDeliveryTime,
    priceRange,
    image,
    owner: req.user._id,
  });

  return created(res, { restaurant }, "Restaurant created successfully");
});

module.exports = {
  getRestaurants,
  getFeatured,
  getMyRestaurant,
  getRestaurant,
  updateRestaurant,
  toggleOpen,
  createRestaurant,
};

