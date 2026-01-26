const express = require("express");
const {
  protectWithAuthService,
  requireOnboarded,
} = require("../middlewares/authMiddleware");

const riderController = require("../controllers/rider.controller");

const router = express.Router();

/**
 * Rider onboarding (first time)
 * NO role checks here
 */
router.post(
  "/onboard",
  protectWithAuthService,
  riderController.onboard
);

/**
 * Update profile (step 2 / later edits)
 */
router.patch(
  "/profile",
  protectWithAuthService,
  requireOnboarded("rider"),
  riderController.updateProfile
);

/**
 * Get rider profile
 */
router.get(
  "/profile",
  protectWithAuthService,
  requireOnboarded("rider"),
  riderController.getRiderProfile
);

module.exports = router;
