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

module.exports = router;
