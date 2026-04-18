const Feedback = require("../models/feedback");

exports.submitFeedback = async (req, res) => {
  try {
    const { rideId, toId, rating, comment, role } = req.body;
    const fromId = req.headers["x-user-id"]; // Gateway should pass this

    console.log("DEBUG: Feedback Submit - Headers:", req.headers);
    console.log("DEBUG: Feedback Submit - Body:", req.body);
    console.log("DEBUG: Feedback Submit - fromId:", fromId);

    if (!rideId || !toId || !rating || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const feedback = new Feedback({
      rideId,
      fromId,
      toId,
      rating,
      comment,
      role,
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Feedback already submitted for this ride" });
    }
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getFeedbackForTarget = async (req, res) => {
  try {
    const { targetId } = req.params;
    const feedbacks = await Feedback.find({ toId: targetId }).sort({ createdAt: -1 });
    
    const stats = await Feedback.aggregate([
      { $match: { toId: new require("mongoose").Types.ObjectId(targetId) } },
      { $group: { _id: null, averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      feedbacks,
      stats: stats[0] || { averageRating: 0, count: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
