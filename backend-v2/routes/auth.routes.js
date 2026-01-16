const router = require("express").Router();
const authCtrl  = require("../controllers/auth.controller");
const oauthCtrl = require("../controllers/oauth.controller");
const { protect } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register",        authLimiter, authCtrl.register);
router.post("/login",           authLimiter, authCtrl.login);
router.post("/logout",          authCtrl.logout);
router.post("/refresh",         authCtrl.refresh);
router.post("/forgot-password", authLimiter, authCtrl.forgotPassword);
router.patch("/reset-password/:token", authCtrl.resetPassword);
router.patch("/change-password", protect, authCtrl.changePassword);
router.get("/me",               protect, authCtrl.getMe);

// OAuth
router.post("/google",   authLimiter, oauthCtrl.googleLogin);
router.post("/facebook", authLimiter, oauthCtrl.facebookLogin);
router.post("/apple",    authLimiter, oauthCtrl.appleLogin);

module.exports = router;
