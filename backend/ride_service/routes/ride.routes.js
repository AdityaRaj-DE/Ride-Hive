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

router.post(
  "/:id/cancel-driver",
  protectWithAuthService,
  requireActiveRole("driver"),
  controller.cancelByDriver
);

router.get(
  "/active",
  protectWithAuthService,
  controller.getActiveRide
);

router.get(
  "/history",
  protectWithAuthService,
  controller.getRideHistory
);

router.get(
  "/:id",
  protectWithAuthService,
  controller.getRideDetails
);

router.post(
  "/sos",
  protectWithAuthService,
  controller.triggerSos
);

router.post(
  "/estimate",
  protectWithAuthService,
  requireActiveRole("rider"),
  controller.estimateRide
);

router.post(
  "/route",
  protectWithAuthService,
  controller.getRouteGeometry
);

router.post("/pool/create", protectWithAuthService, controller.createPoolRide);
router.post("/pool/:rideId/add", protectWithAuthService, controller.addRiderToPool);
router.post("/pool/update-stop", protectWithAuthService, controller.updateStop);

router.get("/pool/available", protectWithAuthService, controller.availablePools);

// ============================
// 🔹 ADMIN INTERNAL
// ============================
router.get("/sos/all", protectWithAuthService, controller.getAllSosAlerts);
router.patch("/sos/:id/resolve", protectWithAuthService, controller.resolveSosAlert);
router.get("/admin/internal/stats", controller.getRideStatsInternal);
router.get("/admin/internal/db/:collection", controller.internalDbGet);
router.put("/admin/internal/db/:collection/:id", controller.internalDbUpdate);
router.get("/admin/internal/trends", controller.getRideTrendsInternal);

module.exports = router;
