const Review = require("../models/Review");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/apiResponse");

// GET /api/reviews/restaurant/:id
const getByRestaurant = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ restaurant: req.params.id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments({ restaurant: req.params.id }),
  ]);

  success(res, {
    reviews,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// POST /api/reviews
const createReview = asyncHandler(async (req, res, next) => {
  const { restaurantId, orderId, rating, comment } = req.body;

  if (!restaurantId || !rating) {
    return next(new AppError("Restaurant ID and rating are required.", 400));
  }

  // Verify the user has a delivered order from this restaurant
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    restaurant: restaurantId,
    status: "Delivered",
  });
  if (!order && orderId) {
    return next(new AppError("You can only review restaurants you have ordered from.", 403));
  }

  const existing = await Review.findOne({ user: req.user._id, restaurant: restaurantId });
  if (existing) {
    return next(new AppError("You have already reviewed this restaurant.", 409));
  }

  const review = await Review.create({
    user: req.user._id,
    restaurant: restaurantId,
    order: orderId,
    rating,
    comment,
  });

  const populated = await review.populate("user", "name avatar");
  created(res, populated, "Review submitted");
});

// DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError("Review not found.", 404));

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("Not authorized to delete this review.", 403));
  }

  await review.deleteOne();
  success(res, null, "Review deleted");
});

module.exports = { getByRestaurant, createReview, deleteReview };
