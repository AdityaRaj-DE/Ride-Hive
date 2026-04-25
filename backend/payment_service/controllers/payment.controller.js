const Payment = require("../models/paymentModel");
const axios = require("axios");

// 🔹 Dummy API for complete flow
exports.createPayment = async (req, res) => {
  try {
    const { rideId, userId, driverId, amount, paymentMethod } = req.body;

    if (!rideId || !userId || !driverId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const payment = await Payment.create({
      rideId,
      userId,
      driverId,
      amount,
      paymentMethod,
      status: "PENDING",
      transactionId: `TXN-${Date.now()}`,
    });

    // 🔗 Integrated with Payment Gateway
    const gateway = require("../services/gateway.service");
    const order = await gateway.createOrder({ 
      amount, 
      receipt: payment.transactionId 
    });

    console.log(`🔸 Payment order created via ${process.env.PAYMENT_PROVIDER || "MOCK"}:`, order.id);

    // Simulation of webhook / async success
    setTimeout(async () => {
      payment.status = "SUCCESS";
      await payment.save();

      // Sync with Auth Service → update user wallet
      try {
        await axios.patch(
          `${process.env.AUTH_SERVICE_URL}/users/wallet`,
          { amount, action: "deduct" },
          { headers: { Authorization: req.headers.authorization } }
        );
      } catch (err) {
        console.warn("⚠️ Wallet sync failed:", err.message);
      }

      // Sync with Driver Service → add earnings
      try {
        await axios.patch(`${process.env.DRIVER_SERVICE_URL}/driver/${driverId}/earnings`, { amount });
      } catch (err) {
        console.warn("⚠️ Driver payout sync failed:", err.message);
      }
    }, 2000);

    res.status(201).json({
      message: "Payment initiated (dummy)",
      payment,
    });
  } catch (err) {
    console.error("createPayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    console.error("getPaymentStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.status !== "SUCCESS")
      return res.status(400).json({ message: "Cannot refund non-successful payment" });

    payment.status = "REFUNDED";
    await payment.save();

    // Sync with wallet (refund to user)
    try {
      await axios.patch(
        `${process.env.AUTH_SERVICE_URL}/users/wallet`,
        { amount: payment.amount, action: "add" },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (err) {
      console.warn("⚠️ Wallet refund failed:", err.message);
    }

    res.json({ message: "Payment refunded successfully", payment });
  } catch (err) {
    console.error("refundPayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDriverTransactions = async (req, res) => {
  try {
    const { driverId } = req.params;
    const transactions = await Payment.find({ driverId })
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json(transactions);
  } catch (err) {
    console.error("getDriverTransactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createPaymentInternal = async (req, res) => {
  try {
    const { rideId, userId, driverId, amount, paymentMethod } = req.body;

    console.log(`💳 [Payment Internal] Processing ${paymentMethod} payment for ride ${rideId}`);

    const payment = await Payment.create({
      rideId,
      userId,
      driverId,
      amount,
      paymentMethod,
      status: paymentMethod === "CASH" ? "SUCCESS" : "PENDING",
      transactionId: `TXN-INT-${Date.now()}`,
    });

    if (paymentMethod === "WALLET") {
      // 🔄 Sync with Auth Service (Deduct from Rider)
      try {
        await axios.patch(
          `${process.env.AUTH_SERVICE_URL}/internal/wallet/${userId}`,
          { amount, action: "deduct" },
          { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
        );
        payment.status = "SUCCESS";
        await payment.save();
        console.log(`✅ [Payment Internal] Wallet deduction success for ${userId}`);
      } catch (err) {
        console.error("❌ [Payment Internal] Wallet deduction failed:", err.message);
        payment.status = "FAILED";
        await payment.save();
        return res.status(400).json({ message: "Payment failed due to wallet deduction error" });
      }
    }

    // 📈 Sync with Driver Service (Record Earnings)
    // Even if CASH, we record for analytics
    try {
      await axios.patch(`${process.env.DRIVER_SERVICE_URL}/driver/${driverId}/earnings`, { 
        amount,
        isCash: paymentMethod === "CASH"
      });
      console.log(`📈 [Payment Internal] Driver earnings updated for ${driverId}`);
    } catch (err) {
      console.warn("⚠️ [Payment Internal] Driver payout sync failed:", err.message);
    }

    return res.status(201).json({
      message: "Payment processed successfully",
      payment,
    });
  } catch (err) {
    console.error("❌ createPaymentInternal error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
