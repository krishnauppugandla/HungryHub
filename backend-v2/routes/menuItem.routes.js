const router = require("express").Router();
const menuCtrl = require("../controllers/menuItem.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.get("/restaurant/:id", menuCtrl.getByRestaurant);

router.post("/",                 protect, restrictTo("seller"), menuCtrl.create);
router.get("/:id",               menuCtrl.getOne);
router.patch("/:id",             protect, restrictTo("seller"), menuCtrl.update);
router.delete("/:id",            protect, restrictTo("seller"), menuCtrl.remove);
router.patch("/:id/availability",protect, restrictTo("seller"), menuCtrl.toggleAvailability);

module.exports = router;
