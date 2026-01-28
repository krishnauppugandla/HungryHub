const crypto = require("crypto");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const tokenService = require("../services/token.service");
const emailService = require("../services/email.service");

// POST /api/auth/register
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Please provide name, email, and password", 400));
  }

  // Disallow registering as admin directly
  const allowedRoles = ["customer", "seller"];
  const userRole = allowedRoles.includes(role) ? role : "customer";

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("An account with this email already exists", 409));
  }

  const user = await User.create({ name, email, password, role: userRole });

  const accessToken = tokenService.signAccessToken(user._id, user.role);
  const refreshToken = tokenService.signRefreshToken(user._id);

  await tokenService.saveRefreshToken(user._id, refreshToken);
  tokenService.setTokenCookies(res, accessToken, refreshToken);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
  };

  return success(res, { user: userResponse, accessToken }, "Account created successfully", 201);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // If user signed up via OAuth and has no password
  if (!user.password) {
    return next(new AppError("Please sign in with your social account", 401));
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been suspended. Please contact support.", 401));
  }

  const accessToken = tokenService.signAccessToken(user._id, user.role);
  const refreshToken = tokenService.signRefreshToken(user._id);

  await tokenService.saveRefreshToken(user._id, refreshToken);
  tokenService.setTokenCookies(res, accessToken, refreshToken);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    favoriteRestaurants: user.favoriteRestaurants,
  };

  return success(res, { user: userResponse, accessToken }, "Logged in successfully");
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new AppError("No refresh token provided", 401));
  }

  // Find in DB first
  const storedToken = await tokenService.findRefreshToken(token);
  if (!storedToken) {
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  // Verify JWT
  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(token);
  } catch (err) {
    await tokenService.deleteRefreshToken(storedToken.userId);
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    return next(new AppError("User not found or suspended", 401));
  }

  // Rotate tokens
  await tokenService.deleteRefreshToken(user._id);

  const newAccessToken = tokenService.signAccessToken(user._id, user.role);
  const newRefreshToken = tokenService.signRefreshToken(user._id);

  await tokenService.saveRefreshToken(user._id, newRefreshToken);
  tokenService.setTokenCookies(res, newAccessToken, newRefreshToken);

  return success(res, { accessToken: newAccessToken }, "Token refreshed successfully");
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (token) {
    const storedToken = await tokenService.findRefreshToken(token);
    if (storedToken) {
      await tokenService.deleteRefreshToken(storedToken.userId);
    }
  }

  tokenService.clearTokenCookies(res);
  return success(res, null, "Logged out successfully");
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide an email address", 400));
  }

  const user = await User.findOne({ email });

  // Always return 200 to prevent email enumeration
  if (!user) {
    return success(res, null, "If that email is registered, you will receive a reset link shortly");
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);

  return success(res, null, "If that email is registered, you will receive a reset link shortly");
});

// PATCH /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Please provide a new password", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Password reset token is invalid or has expired", 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Invalidate all refresh tokens
  await tokenService.deleteRefreshToken(user._id);
  tokenService.clearTokenCookies(res);

  return success(res, null, "Password reset successfully. Please log in with your new password.");
});

// PATCH /api/auth/change-password (protected)
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError("Please provide current and new password", 400));
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user.password) {
    return next(new AppError("You signed up with a social account. Please use OAuth to log in.", 400));
  }

  const isCorrect = await user.comparePassword(currentPassword);
  if (!isCorrect) {
    return next(new AppError("Current password is incorrect", 401));
  }

  user.password = newPassword;
  await user.save();

  // Invalidate other sessions
  await tokenService.deleteRefreshToken(user._id);

  const accessToken = tokenService.signAccessToken(user._id, user.role);
  const refreshToken = tokenService.signRefreshToken(user._id);
  await tokenService.saveRefreshToken(user._id, refreshToken);
  tokenService.setTokenCookies(res, accessToken, refreshToken);

  return success(res, { accessToken }, "Password changed successfully");
});

// GET /api/auth/me (protected)
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("favoriteRestaurants", "name image cuisineType averageRating");
  return success(res, { user }, "User fetched successfully");
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};

