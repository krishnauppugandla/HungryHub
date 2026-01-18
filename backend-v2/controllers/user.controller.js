const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    "favoriteRestaurants",
    "name image cuisineType averageRating deliveryFee isOpen priceRange"
  );

  return success(res, { user }, "Profile fetched successfully");
});

// PATCH /api/users/profile
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, avatar } = req.body;

  // Build update object with only allowed fields
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar !== undefined) updates.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  return success(res, { user }, "Profile updated successfully");
});

// POST /api/users/favorites/:id
const toggleFavorite = asyncHandler(async (req, res, next) => {
  const { id: restaurantId } = req.params;
  const user = await User.findById(req.user._id);

  const isFavorite = user.favoriteRestaurants.some(
    (favId) => favId.toString() === restaurantId
  );

  let updatedUser;
  if (isFavorite) {
    // Remove from favorites
    updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favoriteRestaurants: restaurantId } },
      { new: true }
    ).populate("favoriteRestaurants", "name image cuisineType averageRating");

    return success(res, { user: updatedUser, isFavorite: false }, "Restaurant removed from favorites");
  } else {
    // Add to favorites
    updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favoriteRestaurants: restaurantId } },
      { new: true }
    ).populate("favoriteRestaurants", "name image cuisineType averageRating");

    return success(res, { user: updatedUser, isFavorite: true }, "Restaurant added to favorites");
  }
});

module.exports = { getProfile, updateProfile, toggleFavorite };
