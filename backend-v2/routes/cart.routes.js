const router = require("express").Router();
const cartCtrl = require("../controllers/cart.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.use(protect, restrictTo("customer"));

router.get("/",          cartCtrl.getCart);
router.post("/add",      cartCtrl.addToCart);
router.patch("/item/:id",cartCtrl.updateItem);
router.delete("/item/:id", cartCtrl.removeItem);
router.delete("/",       cartCtrl.clearCart);

module.exports = router;
