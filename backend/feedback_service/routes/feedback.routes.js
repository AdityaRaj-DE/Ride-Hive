const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");

// x-user-id header is assumed to be set by api-gateway
router.post("/submit", feedbackController.submitFeedback);
router.get("/target/:targetId", feedbackController.getFeedbackForTarget);

module.exports = router;
