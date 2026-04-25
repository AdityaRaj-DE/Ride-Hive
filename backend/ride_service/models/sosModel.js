const mongoose = require("mongoose");

const SosSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["rider", "driver"],
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SosAlert", SosSchema);
