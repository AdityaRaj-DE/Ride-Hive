const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    fromId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    toId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    role: {
      type: String,
      enum: ["RIDER_TO_DRIVER", "DRIVER_TO_RIDER"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate feedback for the same ride from the same person
feedbackSchema.index({ rideId: 1, fromId: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
