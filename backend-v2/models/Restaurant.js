const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    cuisineType: [
      {
        type: String,
        trim: true,
      },
    ],
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    deliveryFee: {
      type: Number,
      default: 2.99,
    },
    minimumOrder: {
      type: Number,
      default: 10,
    },
    estimatedDeliveryTime: {
      type: Number,
      default: 35,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
    },
    image: {
      type: String,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
restaurantSchema.index({ name: "text", cuisineType: "text" });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
