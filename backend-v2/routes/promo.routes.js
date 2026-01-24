const router = require("express").Router();
const promoCtrl = require("../controllers/promo.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/validate", protect, promoCtrl.validatePromo);
router.post("/remove",   protect, promoCtrl.removePromo);

module.exports = router;
