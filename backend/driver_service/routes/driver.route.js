const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driver.controller");
const {
  protectWithAuthService,
  requireActiveRole,
  requireRole
} = require("../middlewares/authMiddleware");
const Driver = require("../models/driverModel");


// onboarding steps
router.post("/onboard/basic", protectWithAuthService, requireActiveRole("driver"), driverController.onboardBasic);

router.post("/onboard/vehicle", protectWithAuthService, requireActiveRole("driver"), driverController.onboardVehicle);

router.post("/onboard/documents", protectWithAuthService, requireActiveRole("driver"), driverController.onboardDocuments);

// ✅ Driver self profile (allowed in onboarding too)
router.get(
  "/me",
  protectWithAuthService,
  requireActiveRole("driver"),
  driverController.getDriverProfile
);

// ✅ Driver working features (ONLY after admin approval)
router.put(
  "/availability",
  protectWithAuthService,
  requireRole("driver"),
  driverController.updateAvailability
);

router.put(
  "/location",
  protectWithAuthService,
  requireRole("driver"),
  driverController.updateLocation
);

// ✅ Wallet & Subscription (ONLY after approval)
router.get(
  "/wallet",
  protectWithAuthService,
  requireRole("driver"),
  driverController.getWallet
);

router.post(
  "/wallet/add-funds",
  protectWithAuthService,
  requireRole("driver"),
  driverController.addFunds
);

router.post(
  "/subscription/subscribe",
  protectWithAuthService,
  requireRole("driver"),
  driverController.subscribePlan
);

router.get(
  "/subscription/status",
  protectWithAuthService,
  requireRole("driver"),
  driverController.getOwnSubscriptionStatus
);

// ✅ internal subscription status for Ride Service
router.get("/subscription-status/:userId", driverController.getSubscriptionStatusForService);

// ✅ Nearby drivers (Ride service)
router.get("/nearby", driverController.getNearbyDrivers);

// ✅ Internal lookup (Ride service etc.)
router.get("/by-user/:userId", driverController.getDriverByUserId);
router.patch("/:userId/status", driverController.updateDriverStatusByUserId);

// ✅ Admin routes (should be protected by internal key or admin auth)
router.post("/admin/:driverId/approve", driverController.approveDriver);
router.post("/admin/:driverId/reject", driverController.rejectDriver);

// ⭐ Rating
router.patch("/:id/rating", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const driver = await Driver.findById(id);
    if (!driver) return res.status(404).json({ error: "Driver not found" });

    driver.rating =
      (driver.rating * driver.totalRatings + rating) /
      (driver.totalRatings + 1);

    driver.totalRatings++;
    await driver.save();

    res.json({
      success: true,
      rating: driver.rating,
      totalRatings: driver.totalRatings,
    });
  } catch (err) {
    console.error("Driver rating update:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;