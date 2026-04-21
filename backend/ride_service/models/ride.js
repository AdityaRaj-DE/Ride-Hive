// models/Ride.js
const mongoose = require("mongoose");

const GeoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  { _id: false },
);

const RideSchema = new mongoose.Schema(
  {
    // ---- Ownership ----
    riderId: {
      type: String,
      required: function () {
        return this.rideType === "NORMAL";
      },
      index: true,
    },

    rideType: {
      type: String,
      enum: ["NORMAL", "POOL"],
      default: "NORMAL",
      index: true,
    },

    // ---- Pool Riders ----
    riders: [
      {
        riderId: {
          type: String,
          required: true,
        },

        pickup: {
          type: GeoPointSchema,
          required: true,
        },

        drop: {
          type: GeoPointSchema,
          required: true,
        },

        status: {
          type: String,
          enum: ["WAITING", "PICKED", "DROPPED", "CANCELLED"],
          default: "WAITING",
        },
        otp: {
          type: String,
          default: null,
        },
      },
    ],

    maxSeats: {
      type: Number,
      default: function () {
        return this.rideType === "POOL" ? 4 : 1;
      },
    },

    availableSeats: {
      type: Number,
      default: function () {
        return this.rideType === "POOL" ? 4 : 1;
      },
    },

    route: [
      {
        type: {
          type: String,
          enum: ["PICKUP", "DROP"],
          required: true,
        },
        riderId: {
          type: String,
          required: true,
        },
        location: {
          type: GeoPointSchema,
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],

    driverId: {
      type: String,
      default: null,
      index: true,
    },

    // ---- NORMAL ride only ----
    pickup: {
      type: GeoPointSchema,
      required: function () {
        return this.rideType === "NORMAL";
      },
    },

    drop: {
      type: GeoPointSchema,
      required: function () {
        return this.rideType === "NORMAL";
      },
    },

    // ---- Ride FSM ----
    status: {
      type: String,
      enum: [
        "REQUESTED",
        "SEARCHING",
        "DRIVER_ASSIGNED",
        "DRIVER_ARRIVING",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED_BY_RIDER",
        "CANCELLED_BY_DRIVER",
        "EXPIRED",
      ],
      default: "REQUESTED",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "WALLET"],
      default: "WALLET",
    },

    // ---- Pricing ----
    priceEstimate: {
      type: Number,
      default: 0,
    },

    finalPrice: {
      type: Number,
      default: null,
    },

    distance: {
      type: Number,
      default: 0,
    },

    duration: {
      type: Number,
      default: 0,
    },

    routeGeometry: {
      type: Object,
      default: null,
    },

    // ---- OTP ----
    rideStartOtp: {
      code: String,
      expiresAt: Date,
      verified: {
        type: Boolean,
        default: false,
      },
    },

    // ---- Lifecycle ----
    requestedAt: Date,
    assignedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,

    cancelReason: String,
  },
  { timestamps: true },
);

// Geo index for future matching
RideSchema.index({ pickup: "2dsphere" });
RideSchema.index({ "route.location": "2dsphere" });

module.exports = mongoose.model("Ride", RideSchema);
