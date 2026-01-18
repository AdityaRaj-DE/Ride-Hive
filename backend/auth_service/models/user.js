// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    

    mobileNumber: { type: String, required: true, unique: true, index: true },

    isVerified: { type: Boolean, default: false },

    // ✅ Role-based system (single user)
    roles: {
      rider: { type: Boolean, default: true },
      driver: { type: Boolean, default: false },
    },

    // Which UI to open after login
    activeRole: {
      type: String,
      enum: ["rider", "driver"],
      default: "rider",
    },

    onboarding: {
      rider: { type: Boolean, default: false },
      driver: { type: Boolean, default: false }
    }
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
