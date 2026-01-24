const express = require("express");
const {  protectWithAuthService, requireRole, requireActiveRole } = require("../middlewares/authMiddleware");
const riderController = require("../controllers/rider.controller");

const router = express.Router();
router.post(
  "/onboard",
  protectWithAuthService,
  requireRole("rider"),
  requireActiveRole("rider"),
  riderController.onboard
);


module.exports = router;