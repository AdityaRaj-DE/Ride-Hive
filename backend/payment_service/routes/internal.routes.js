const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { internalOnly } = require("../middlewares/internalOnly");

router.post(
  "/payments",
  internalOnly,
  paymentController.createPaymentInternal
);

module.exports = router;
