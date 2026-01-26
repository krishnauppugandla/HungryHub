const router = require("express").Router();
const paymentCtrl = require("../controllers/payment.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

router.post("/intent", protect, restrictTo("customer"), paymentCtrl.createPaymentIntent);

module.exports = router;
