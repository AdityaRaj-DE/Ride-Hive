const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" }, // Home/Work/Friend
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },

    // optional geo
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const riderProfileSchema = new mongoose.Schema(
  {
    // IMPORTANT: This is the link to Auth service userId
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    // Basic profile
    name: {
      first: { type: String, default: "", minlength: 2 },
      last: { type: String, default: "" },
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      // not unique here, because uniqueness must be at auth/user level ideally
    },

    profileImageUrl: { type: String, default: "" },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say", ""],
      default: "",
    },

    dob: { type: Date }, // optional

    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" },
    },

    savedLocations: {
      home: { type: locationSchema, default: () => ({ label: "Home" }) },
      work: { type: locationSchema, default: () => ({ label: "Work" }) },
      other: { type: [locationSchema], default: [] },
    },

    preferences: {
      language: { type: String, default: "en" },
      notification: {
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
    },

    // ⭐ rating fields (track properly)
    rating: {
      avg: { type: Number, default: 5.0, min: 1, max: 5 },
      total: { type: Number, default: 0, min: 0 },
    },

    // onboarding
    onboardingCompleted: { type: Boolean, default: false },
    onboardingCompletedAt: { type: Date },

    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RiderProfile", riderProfileSchema);
