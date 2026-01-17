const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/otp/send", authController.sendOtp);
router.post("/otp/verify", authController.verifyOtp);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// switch between rider/driver
router.post("/role/activate", authController.activateRole);

module.exports = router;
