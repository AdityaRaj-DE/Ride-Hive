const axios = require("axios");

/**
 * 💳 Payment Gateway Service
 * Handles integration with external providers (Stripe/Razorpay)
 */
class PaymentGatewayService {
  constructor() {
    this.provider = process.env.PAYMENT_PROVIDER || "MOCK";
  }

  /**
   * Create a checkout session or order
   */
  async createOrder({ amount, currency = "INR", receipt }) {
    if (this.provider === "STRIPE") {
      // return await stripe.paymentIntents.create({...});
      console.log("💳 Creating Stripe Payment Intent...");
      return { id: `stripe_${Date.now()}`, url: "https://stripe.com/mock-checkout" };
    }

    if (this.provider === "RAZORPAY") {
       // return await razorpay.orders.create({...});
       console.log("💳 Creating Razorpay Order...");
       return { id: `rzp_${Date.now()}`, key: process.env.RAZORPAY_KEY_ID };
    }

    // Default MOCK
    console.log("💳 Creating Mock Order...");
    return { id: `mock_${Date.now()}`, status: "created" };
  }

  /**
   * Verify payment webhook or signature
   */
  async verifyPayment(payload) {
     if (this.provider === "MOCK") return true;
     // Add real verification logic for Stripe/Razorpay here
     return true;
  }
}

module.exports = new PaymentGatewayService();
