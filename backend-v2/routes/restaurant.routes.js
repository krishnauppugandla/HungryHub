const router = require("express").Router();
const restCtrl = require("../controllers/restaurant.controller");
const { protect, restrictTo, optionalAuth } = require("../middleware/auth.middleware");

router.get("/",         optionalAuth, restCtrl.getRestaurants);
router.get("/featured", restCtrl.getFeatured);
router.get("/my",       protect, restrictTo("seller"), restCtrl.getMyRestaurant);
router.get("/:id",      optionalAuth, restCtrl.getRestaurant);

router.post("/",         protect, restrictTo("seller"), restCtrl.createRestaurant);
router.patch("/:id",     protect, restrictTo("seller"), restCtrl.updateRestaurant);
router.patch("/:id/toggle-open", protect, restrictTo("seller"), restCtrl.toggleOpen);

module.exports = router;
