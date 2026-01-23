const express = require("express");
const router = express.Router();

const {
  protectWithAuthService,
  requireActiveRole,
  requireRole,
} = require("../middleware/authMiddleware");

const controller = require("../controllers/ride.controller");

// Rider
router.post("/request", protectWithAuthService, requireActiveRole("rider"), controller.rideRequest);
router.get("/active", protectWithAuthService, controller.activeRide);
router.post("/cancel/:rideId", protectWithAuthService, controller.rideCancel);
router.post("/:rideId/rating/driver", protectWithAuthService, requireActiveRole("rider"), controller.rateDriver);

// Driver (ONLY approved role holders)
router.post("/accept/:rideId", protectWithAuthService, requireRole("driver"), controller.rideAccept);
router.post("/start/:rideId", protectWithAuthService, requireRole("driver"), controller.rideStart);
router.post("/complete/:rideId", protectWithAuthService, requireRole("driver"), controller.rideComplete);
router.post("/:rideId/rating/rider", protectWithAuthService, requireRole("driver"), controller.rateRider);

// Any authenticated user
router.get("/:rideId", protectWithAuthService, controller.rideData);

// History (fix these later to "me" endpoints; currently insecure)
router.get("/history/user/:userId", protectWithAuthService, controller.rideHistoryUser);
router.get("/history/driver/:driverId", protectWithAuthService, controller.rideHistoryDriver);

module.exports = router;
