const router = require("express").Router();
const userCtrl = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/profile",        userCtrl.getProfile);
router.patch("/profile",      userCtrl.updateProfile);
router.post("/favorites/:id", userCtrl.toggleFavorite);

module.exports = router;
