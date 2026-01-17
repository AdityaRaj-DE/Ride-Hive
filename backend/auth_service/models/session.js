const mongoose = require("mongoose");
const crypto = require("crypto");

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    deviceId: { type: String, required: true },
    refreshTokenHash: { type: String, required: true },

    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

sessionSchema.statics.hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");
  

module.exports = mongoose.model("Session", sessionSchema);
