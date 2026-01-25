const router = require("express").Router();
const adminCtrl = require("../controllers/admin.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.use(protect, restrictTo("admin"));

router.get("/stats", adminCtrl.getStats);

router.get("/users",               adminCtrl.getUsers);
router.patch("/users/:id/suspend", adminCtrl.suspendUser);

router.get("/restaurants",                   adminCtrl.getRestaurants);
router.patch("/restaurants/:id/feature",     adminCtrl.featureRestaurant);
router.patch("/restaurants/:id/activate",    adminCtrl.activateRestaurant);

router.get("/orders",              adminCtrl.getOrders);
router.patch("/orders/:id/status", adminCtrl.updateOrderStatus);

module.exports = router;
