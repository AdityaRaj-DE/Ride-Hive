const Razorpay = require("razorpay");
const crypto = require("crypto");
const axios = require("axios");

// Initialize Razorpay
// Note: We use process.env.RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret",
});

exports.createSubscriptionOrder = async (req, res) => {
  try {
    const { driverId, plan, amount } = req.body;

    if (!driverId || !plan || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_sub_${driverId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("createSubscriptionOrder error:", err);
    res.status(500).json({ message: "Server error creating Razorpay order" });
  }
};

exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      driverId,
      plan,
      durationDays,
    } = req.body;

    // Verify the signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummysecret")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is successful, activate subscription in driver_service
      try {
        await axios.post(
          `${process.env.DRIVER_SERVICE_URL}/${driverId}/subscription/activate`,
          { plan, durationDays },
          { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
        );

        res.status(200).json({
          success: true,
          message: "Payment verified and subscription activated successfully",
        });
      } catch (err) {
        console.error("Error activating subscription in driver service:", err.message);
        res.status(500).json({
          success: false,
          message: "Payment verified but failed to activate subscription",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (err) {
    console.error("verifySubscriptionPayment error:", err);
    res.status(500).json({ message: "Server error verifying payment" });
  }
};
