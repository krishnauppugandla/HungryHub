const Address = require("../models/Address");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/apiResponse");

// GET /api/addresses
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  success(res, addresses);
});

// POST /api/addresses
const createAddress = asyncHandler(async (req, res, next) => {
  const count = await Address.countDocuments({ user: req.user._id });
  if (count >= 5) return next(new AppError("You can save a maximum of 5 addresses.", 400));

  const { label, street, city, state, zipCode } = req.body;
  if (!street || !city) return next(new AppError("Street and city are required.", 400));

  // First address is automatically default
  const isDefault = count === 0 ? true : !!req.body.isDefault;

  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({
    user: req.user._id,
    label: label || "Home",
    street,
    city,
    state,
    zipCode,
    isDefault,
  });

  created(res, address, "Address saved");
});

// PATCH /api/addresses/:id
const updateAddress = asyncHandler(async (req, res, next) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) return next(new AppError("Address not found.", 404));

  const { label, street, city, state, zipCode } = req.body;
  if (label !== undefined) address.label = label;
  if (street !== undefined) address.street = street;
  if (city !== undefined) address.city = city;
  if (state !== undefined) address.state = state;
  if (zipCode !== undefined) address.zipCode = zipCode;

  await address.save();
  success(res, address, "Address updated");
});

// DELETE /api/addresses/:id
const deleteAddress = asyncHandler(async (req, res, next) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) return next(new AppError("Address not found.", 404));

  const wasDefault = address.isDefault;
  await address.deleteOne();

  // If deleted was default, promote the most recent remaining address
  if (wasDefault) {
    const next_addr = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (next_addr) {
      next_addr.isDefault = true;
      await next_addr.save();
    }
  }

  success(res, null, "Address deleted");
});

// PATCH /api/addresses/:id/default
const setDefault = asyncHandler(async (req, res, next) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) return next(new AppError("Address not found.", 404));

  await Address.updateMany({ user: req.user._id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  success(res, address, "Default address updated");
});

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress, setDefault };
