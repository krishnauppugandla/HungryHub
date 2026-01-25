const router = require("express").Router();
const orderCtrl = require("../controllers/order.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.post("/",                  protect, restrictTo("customer"), orderCtrl.createOrder);
router.get("/my",                 protect, restrictTo("customer"), orderCtrl.getMyOrders);
router.get("/restaurant",         protect, restrictTo("seller"),   orderCtrl.getRestaurantOrders);
router.get("/:id",                protect, orderCtrl.getOrder);
router.patch("/:id/status",       protect, restrictTo("seller", "admin"), orderCtrl.updateOrderStatus);
router.post("/:id/reorder",       protect, restrictTo("customer"), orderCtrl.reorder);

module.exports = router;
