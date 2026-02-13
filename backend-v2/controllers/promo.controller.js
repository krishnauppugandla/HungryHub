const PromoCode = require("../models/PromoCode");
const Cart = require("../models/Cart");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");

// POST /api/promo/validate  — validate AND apply promo to cart
const validatePromo = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  if (!code) return next(new AppError("Promo code is required.", 400));

  // Need the cart to get current subtotal
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty.", 400));
  }

  const orderTotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const promo = await PromoCode.findOne({ code: code.toUpperCase().trim(), isActive: true });

  if (!promo) return next(new AppError("Invalid promo code.", 400));
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return next(new AppError("This promo code has expired.", 400));
  }
  if (orderTotal < promo.minimumOrderAmount) {
    return next(
      new AppError(`Minimum order amount of $${promo.minimumOrderAmount.toFixed(2)} required.`, 400)
    );
  }
  if (promo.usedCount >= promo.usageLimit) {
    return next(new AppError("This promo code has reached its usage limit.", 400));
  }

  const userUsedCount = promo.usedBy.filter(
    (id) => id.toString() === req.user._id.toString()
  ).length;

  if (userUsedCount >= promo.perUserLimit) {
    return next(new AppError("You have already used this promo code the maximum number of times.", 400));
  }

  let discount = 0;
  if (promo.discountType === "percentage") {
    discount = parseFloat(((orderTotal * promo.discountValue) / 100).toFixed(2));
    discount = Math.min(discount, 10); // cap at $10
  } else {
    discount = parseFloat(Math.min(promo.discountValue, orderTotal).toFixed(2));
  }

  // Save promo to cart so the discount persists and shows in UI
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { discount, promoCode: promo.code },
    { new: true }
  );

  success(res, {
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discount,
  }, `Promo applied: -$${discount.toFixed(2)}`);
});

// POST /api/promo/remove  — clear promo from cart
const removePromo = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { discount: 0, promoCode: null }
  );
  success(res, null, "Promo code removed");
});

module.exports = { validatePromo, removePromo };

