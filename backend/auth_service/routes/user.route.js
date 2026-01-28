const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {protect} = require("../middlewares/auth.middleware")

router.post("/otp/send", authController.sendOtp);
router.post("/otp/verify", authController.verifyOtp);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.me);

// switch between rider/driver
router.post("/role/activate", protect,authController.activateRole);

module.exports = router;
