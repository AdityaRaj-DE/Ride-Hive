// routes/pool.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/pool.controller");

router.post("/request", controller.requestPool);

module.exports = router;