const express = require("express");
const router = express.Router();

const {
  protectWithAuthService,
  requireActiveRole,
  requireOnboarded,
} = require("../middleware/authMiddleware");

const controller = require("../controllers/ride.controller");

// Rider
router.post(
  "/",
  protectWithAuthService,
  requireActiveRole("rider"),
  requireOnboarded("rider"),
  controller.createRide
);

router.post(
  "/:id/cancel",
  protectWithAuthService,
  requireActiveRole("rider"),
  controller.cancelByRider
);

// Driver
router.get(
  "/available",
  protectWithAuthService,
  requireActiveRole("driver"),
  requireOnboarded("driver"),
  controller.availableRides
);

router.post(
  "/:id/accept",
  protectWithAuthService,
  requireActiveRole("driver"),
  requireOnboarded("driver"),
  controller.acceptRide
);

router.post(
  "/:id/arriving",
  protectWithAuthService,
  requireActiveRole("driver"),
  controller.driverArriving
);

router.post(
  "/:id/start",
  protectWithAuthService,
  requireActiveRole("driver"),
  controller.startRide
);

router.post(
  "/:id/complete",
  protectWithAuthService,
  requireActiveRole("driver"),
  controller.completeRide
);

module.exports = router;
