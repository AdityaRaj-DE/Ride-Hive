const express = require("express");
const router = express.Router();

const { internalOnly } = require("../middlewares/internalOnly");
const userController = require("../controllers/auth.controller");

router.patch(
  "/users/:userId/onboarding",
  internalOnly,
  userController.updateOnboarding
);

router.get(
  "/users/:userId",
  internalOnly,
  userController.getUserByIdInternal
);

router.patch(
  "/wallet/:userId",
  internalOnly,
  userController.updateWalletInternal
);

// ============================
// 🔹 ADMIN INTERNAL
// ============================
router.get("/admin/internal/stats", internalOnly, userController.getUserStatsInternal);
router.get("/admin/internal/db/:collection", internalOnly, userController.internalDbGet);
router.put("/admin/internal/db/:collection/:id", internalOnly, userController.internalDbUpdate);

module.exports = router;
