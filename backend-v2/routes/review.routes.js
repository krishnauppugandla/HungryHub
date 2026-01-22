const router = require("express").Router();
const reviewCtrl = require("../controllers/review.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.get("/restaurant/:id", reviewCtrl.getByRestaurant);
router.post("/",              protect, restrictTo("customer"), reviewCtrl.createReview);
router.delete("/:id",         protect, reviewCtrl.deleteReview);

module.exports = router;
