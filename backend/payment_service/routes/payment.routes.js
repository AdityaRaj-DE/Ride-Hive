const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const subscriptionController = require("../controllers/subscription.controller");

// 🔐 Payment Flow
router.post("/create", paymentController.createPayment);
router.get("/status/:paymentId", paymentController.getPaymentStatus);
router.patch("/refund/:paymentId", paymentController.refundPayment);
router.get("/driver/:driverId", paymentController.getDriverTransactions);

// 💳 Subscription Flow
router.post("/subscription/create-order", subscriptionController.createSubscriptionOrder);
router.post("/subscription/verify", subscriptionController.verifySubscriptionPayment);

module.exports = router;
