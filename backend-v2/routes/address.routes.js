const router = require("express").Router();
const addrCtrl = require("../controllers/address.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/",              addrCtrl.getAddresses);
router.post("/",             addrCtrl.createAddress);
router.patch("/:id",         addrCtrl.updateAddress);
router.delete("/:id",        addrCtrl.deleteAddress);
router.patch("/:id/default", addrCtrl.setDefault);

module.exports = router;
