const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");

// GET /api/cart
const getCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("restaurant", "name image deliveryFee minimumOrder isOpen")
    .populate("items.menuItem", "name price image isAvailable");

  if (!cart) {
    return success(res, { cart: null, items: [], restaurant: null }, "Cart is empty");
  }

  return success(res, { cart }, "Cart fetched successfully");
});

// POST /api/cart/add
const addToCart = asyncHandler(async (req, res, next) => {
  const { restaurantId, itemId, quantity = 1 } = req.body;

  if (!restaurantId || !itemId) {
    return next(new AppError("restaurantId and itemId are required", 400));
  }

  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  // Verify restaurant and item exist
  const [restaurant, menuItem] = await Promise.all([
    Restaurant.findById(restaurantId),
    MenuItem.findById(itemId),
  ]);

  if (!restaurant) {
    return next(new AppError("Restaurant not found", 404));
  }

  if (!menuItem) {
    return next(new AppError("Menu item not found", 404));
  }

  if (!menuItem.isAvailable) {
    return next(new AppError("This item is currently unavailable", 400));
  }

  if (menuItem.restaurant.toString() !== restaurantId) {
    return next(new AppError("This item does not belong to the specified restaurant", 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    // If cart is from a different restaurant, clear and start fresh
    if (cart.restaurant && cart.restaurant.toString() !== restaurantId) {
      cart.restaurant = restaurantId;
      cart.items = [];
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.menuItem && item.menuItem.toString() === itemId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        menuItem: itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      });
    }

    await cart.save();
  } else {
    // Create new cart
    cart = await Cart.create({
      user: req.user._id,
      restaurant: restaurantId,
      items: [
        {
          menuItem: itemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity,
        },
      ],
    });
  }

  await cart.populate("restaurant", "name image deliveryFee minimumOrder isOpen");
  await cart.populate("items.menuItem", "name price image isAvailable");

  return success(res, { cart }, "Item added to cart");
});

// PATCH /api/cart/item/:id
const updateItem = asyncHandler(async (req, res, next) => {
  const { id: itemId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity === null) {
    return next(new AppError("Quantity is required", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  // If cart is now empty, optionally clear the restaurant
  if (cart.items.length === 0) {
    cart.restaurant = undefined;
  }

  await cart.save();
  await cart.populate("restaurant", "name image deliveryFee minimumOrder isOpen");
  await cart.populate("items.menuItem", "name price image isAvailable");

  return success(res, { cart }, "Cart updated successfully");
});

// DELETE /api/cart/item/:id
const removeItem = asyncHandler(async (req, res, next) => {
  const { id: itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item._id.toString() !== itemId
  );

  if (cart.items.length === initialLength) {
    return next(new AppError("Item not found in cart", 404));
  }

  if (cart.items.length === 0) {
    cart.restaurant = undefined;
  }

  await cart.save();
  await cart.populate("restaurant", "name image deliveryFee minimumOrder isOpen");

  return success(res, { cart }, "Item removed from cart");
});

// DELETE /api/cart
const clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  return success(res, null, "Cart cleared successfully");
});

module.exports = { getCart, addToCart, updateItem, removeItem, clearCart };
