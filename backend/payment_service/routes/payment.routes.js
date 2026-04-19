const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// 🔐 Payment Flow
router.post("/create", paymentController.createPayment);
router.get("/status/:paymentId", paymentController.getPaymentStatus);
router.patch("/refund/:paymentId", paymentController.refundPayment);
router.get("/driver/:driverId", paymentController.getDriverTransactions);

module.exports = router;
