const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    uploadedAt: { type: Date },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    rejectedReason: { type: String, default: "" },
  },
  { _id: false }
);

const driverSchema = new mongoose.Schema(
  {
    // Link to auth-service user _id
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    // Driver lifecycle
    status: {
      type: String,
      enum: ["draft", "pending_review", "approved", "rejected", "suspended"],
      default: "draft",
      index: true,
    },

    // basic profile
    fullname: {
      firstname: { type: String, required: true, minlength: 3, trim: true },
      lastname: { type: String, trim: true },
    },

    // vehicle info
    vehicleInfo: {
      model: { type: String, default: "" },
      plateNumber: { type: String, default: "" },
      color: { type: String, default: "" },
      type: { type: String, default: "" }, // bike/car/etc.
    },

    // legal info
    licenseNumber: { type: String, required: true, index: true },

    // Documents (required for approval)
    documents: {
      drivingLicense: { type: documentSchema, default: () => ({}) },
      rcBook: { type: documentSchema, default: () => ({}) },
      insurance: { type: documentSchema, default: () => ({}) },
      profilePhoto: { type: documentSchema, default: () => ({}) },
    },

    // Verification block
    verification: {
      licenseVerified: { type: Boolean, default: false },
      vehicleVerified: { type: Boolean, default: false },
      backgroundCheckPassed: { type: Boolean, default: false },
      verifiedAt: { type: Date },
    },

    onboarding: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      step: {
        type: String,
        enum: ["basic", "vehicle", "documents", "review", "done"],
        default: "basic",
      },
    },

    // Ratings
    rating: { type: Number, default: 5, min: 1, max: 5 },
    totalRatings: { type: Number, default: 0 },

    totalRides: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    cashEarnings: { type: Number, default: 0 },

    // Acceptance Rate tracking
    totalOffers: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },

    // IMPORTANT: must be false until approved
    isAvailable: { type: Boolean, default: false },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
    

    walletBalance: { type: Number, default: 0 },

    subscription: {
      isActive: { type: Boolean, default: false },
      plan: {
        name: { type: String },
        durationDays: { type: Number },
        price: { type: Number },
      },
      startedAt: { type: Date },
      expiresAt: { type: Date },
    },
  },
  { timestamps: true }
);
driverSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Driver", driverSchema);
