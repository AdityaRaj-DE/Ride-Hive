const mongoose = require("mongoose");
const crypto = require("crypto");

const otpSchema = new mongoose.Schema(
  {
    mobileNumber: { type: String, required: true, index: true },

    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },

    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// auto delete after expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.statics.hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

module.exports = mongoose.model("Otp", otpSchema);
