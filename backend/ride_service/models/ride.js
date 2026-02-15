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
  { _id: false }
);

const RideSchema = new mongoose.Schema(
  {
    // ---- Ownership ----
    riderId: {
      type: String,
      required: true,
      index: true,
    },

    driverId: {
      type: String,
      default: null,
      index: true,
    },

    // ---- Locations ----
    pickup: {
      type: GeoPointSchema,
      required: true,
    },

    drop: {
      type: GeoPointSchema,
      required: true,
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

    // ---- Pricing (snapshot only) ----
    priceEstimate: {
      type: Number,
      default: 0,
    },

    finalPrice: {
      type: Number,
      default: null,
    },

    distance: {
      type: Number, // meters
      default: 0,
    },
    
    duration: {
      type: Number, // seconds
      default: 0,
    },
    
    // ---- Route Geometry (for map rendering later) ----
    routeGeometry: {
      type: Object,
      default: null,
    },

    // ---- Lifecycle timestamps ----
    requestedAt: Date,
    assignedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,

    cancelReason: String,
  },
  { timestamps: true }
);

// Geo index for future matching
RideSchema.index({ pickup: "2dsphere" });

module.exports = mongoose.model("Ride", RideSchema);
