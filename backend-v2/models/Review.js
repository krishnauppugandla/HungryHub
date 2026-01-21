const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// A user can only review a restaurant once
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });

// Helper to update restaurant rating stats
const updateRestaurantRating = async (restaurantId) => {
  const Restaurant = mongoose.model("Restaurant");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: "$restaurant",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  } else {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// Post-save hook: update restaurant rating after new review
reviewSchema.post("save", async function () {
  await updateRestaurantRating(this.restaurant);
});

// Post-remove hook: update restaurant rating after review removed
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await updateRestaurantRating(doc.restaurant);
  }
});

// Handle deleteOne middleware
reviewSchema.post("deleteOne", { document: true, query: false }, async function () {
  await updateRestaurantRating(this.restaurant);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
