const fetch = require("node-fetch");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const tokenService = require("../services/token.service");

// Helper: find or create OAuth user
const findOrCreateOAuthUser = async (provider, providerId, email, name, avatar) => {
  const providerField = `${provider}Id`;

  // 1. Try to find by providerId
  let user = await User.findOne({ [providerField]: providerId });
  if (user) return user;

  // 2. Try to find by email and link account
  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user[providerField] = providerId;
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
      return user;
    }
  }

  // 3. Create new user
  const newUser = await User.create({
    [providerField]: providerId,
    email: email || `${provider}_${providerId}@hungryhub.com`,
    name,
    avatar: avatar || "",
    role: "customer",
  });

  return newUser;
};

// POST /api/auth/google
const googleLogin = asyncHandler(async (req, res, next) => {
  const { accessToken: googleToken } = req.body;

  if (!googleToken) {
    return next(new AppError("Google access token is required", 400));
  }

  // Fetch user info from Google
  let googleUser;
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        headers: { Authorization: `Bearer ${googleToken}` },
      }
    );

    if (!response.ok) {
      return next(new AppError("Failed to verify Google token", 401));
    }

    googleUser = await response.json();
  } catch (err) {
    return next(new AppError("Failed to connect to Google", 502));
  }

  if (!googleUser.id) {
    return next(new AppError("Invalid Google token response", 401));
  }

  const user = await findOrCreateOAuthUser(
    "google",
    googleUser.id,
    googleUser.email,
    googleUser.name,
    googleUser.picture
  );

  if (!user.isActive) {
    return next(new AppError("Your account has been suspended. Please contact support.", 401));
  }

  const appAccessToken = tokenService.signAccessToken(user._id, user.role);
  const refreshToken = tokenService.signRefreshToken(user._id);

  await tokenService.saveRefreshToken(user._id, refreshToken);
  tokenService.setTokenCookies(res, appAccessToken, refreshToken);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
  };

  return success(res, { user: userResponse, accessToken: appAccessToken }, "Google login successful");
});

// POST /api/auth/facebook
const facebookLogin = asyncHandler(async (req, res, next) => {
  const { accessToken: fbToken } = req.body;

  if (!fbToken) {
    return next(new AppError("Facebook access token is required", 400));
  }

  // Fetch user info from Facebook Graph API
  let fbUser;
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fbToken}`
    );

    if (!response.ok) {
      return next(new AppError("Failed to verify Facebook token", 401));
    }

    fbUser = await response.json();
  } catch (err) {
    return next(new AppError("Failed to connect to Facebook", 502));
  }

  if (!fbUser.id || fbUser.error) {
    return next(new AppError("Invalid Facebook token", 401));
  }

  const avatar = fbUser.picture?.data?.url || "";

  const user = await findOrCreateOAuthUser(
    "facebook",
    fbUser.id,
    fbUser.email,
    fbUser.name,
    avatar
  );

  if (!user.isActive) {
    return next(new AppError("Your account has been suspended. Please contact support.", 401));
  }

  const appAccessToken = tokenService.signAccessToken(user._id, user.role);
  const refreshToken = tokenService.signRefreshToken(user._id);

  await tokenService.saveRefreshToken(user._id, refreshToken);
  tokenService.setTokenCookies(res, appAccessToken, refreshToken);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
  };

  return success(res, { user: userResponse, accessToken: appAccessToken }, "Facebook login successful");
});

// POST /api/auth/apple
const appleLogin = asyncHandler(async (req, res, next) => {
  // Apple Sign In requires Apple Developer credentials (private key, team ID, etc.)
  // Configure APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY in .env to enable
  return next(
    new AppError(
      "Apple Sign In requires Apple Developer account configuration. Please contact the administrator.",
      501
    )
  );
});

module.exports = { googleLogin, facebookLogin, appleLogin, findOrCreateOAuthUser };
