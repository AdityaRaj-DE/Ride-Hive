const express = require("express");
const router = express.Router();
const axios = require("axios");

const SERVICES = {
  DRIVER: process.env.DRIVER_SERVICE_URL || "http://localhost:3003",
  AUTH: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  RIDE: process.env.RIDE_SERVICE_URL || "http://localhost:3004",
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3007",
};

const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || "super-secret-key-change-this";

// Helper for axios calls to services
const serviceCall = axios.create({
  timeout: 5000,
  headers: {
    "x-internal-key": INTERNAL_KEY
  }
});

// Helper for standardized error responding
const handleServiceError = (res, err, message) => {
  console.error(`❌ [Admin API Error] ${message}:`, err.message);
  const status = err.response?.status || 500;
  const detail = err.response?.data?.message || err.message;
  res.status(status).json({ message, detail });
};

// ============================
// 🔹 OTP RECEIVER
// ============================
const otpLogs = []; 
router.post("/otps", (req, res) => {
  const { target, code, type, service, timestamp } = req.body;
  if (!target || !code) return res.status(400).json({ message: "Missing target/code" });

  const logEntry = { 
    target, 
    code, 
    type: type || "OTP", 
    service: service || "unknown", 
    timestamp: timestamp || new Date() 
  };
  
  console.log(`📩 OTP synced: ${code} to ${target} from ${service}`);
  otpLogs.unshift(logEntry);
  if (otpLogs.length > 500) otpLogs.pop();

  const io = req.app.get("io");
  if (io) io.emit("otp.new", logEntry);

  res.sendStatus(200);
});

router.get("/otps", (req, res) => {
  res.json(otpLogs);
});

// ============================
// 🔹 DRIVER VERIFICATION
// ============================
router.get("/drivers/pending", async (req, res) => {
  try {
    const { data } = await serviceCall.get(`${SERVICES.DRIVER}/admin/internal/drivers/pending`);
    res.json(data);
  } catch (err) {
    handleServiceError(res, err, "Error fetching pending drivers");
  }
});

router.post("/drivers/:userId/approve", async (req, res) => {
  try {
    const { data } = await serviceCall.post(`${SERVICES.DRIVER}/admin/internal/drivers/approve/${req.params.userId}`);
    res.json(data);
  } catch (err) {
    handleServiceError(res, err, "Error approving driver");
  }
});

// ============================
// 🔹 DB EXPLORER
// ============================
const collectionMap = {
  users: 'AUTH',
  otps: 'AUTH',
  drivers: 'DRIVER',
  rides: 'RIDE'
};

router.get("/db/:collection", async (req, res) => {
  const { collection } = req.params;
  const serviceKey = collectionMap[collection];
  const serviceUrl = SERVICES[serviceKey];
  
  if (!serviceUrl) return res.status(404).json({ message: "Collection not mapped to a service" });

  try {
    const fullUrl = serviceKey === 'AUTH' 
      ? `${serviceUrl}/internal/admin/internal/db/${collection}`
      : `${serviceUrl}/admin/internal/db/${collection}`;
      
    const { data } = await serviceCall.get(fullUrl);
    res.json(data);
  } catch (err) {
    handleServiceError(res, err, `Error fetching collection ${collection}`);
  }
});

router.put("/db/:collection/:id", async (req, res) => {
  const { collection, id } = req.params;
  const serviceKey = collectionMap[collection];
  const serviceUrl = SERVICES[serviceKey];

  if (!serviceUrl) return res.status(404).json({ message: "Collection not mapped to a service" });

  try {
    const fullUrl = serviceKey === 'AUTH' 
      ? `${serviceUrl}/internal/admin/internal/db/${collection}/${id}`
      : `${serviceUrl}/admin/internal/db/${collection}/${id}`;

    const { data } = await serviceCall.put(fullUrl, req.body);
    res.json(data);
  } catch (err) {
    handleServiceError(res, err, `Error updating record ${id}`);
  }
});

// ============================
// 🔹 ANALYTICS
// ============================
router.get("/analytics", async (req, res) => {
  try {
    const [authRes, rideRes, driverRes, trendsRes, pendingRes] = await Promise.allSettled([
      serviceCall.get(`${SERVICES.AUTH}/internal/admin/internal/stats`),
      serviceCall.get(`${SERVICES.RIDE}/admin/internal/stats`),
      serviceCall.get(`${SERVICES.DRIVER}/admin/internal/stats`),
      serviceCall.get(`${SERVICES.RIDE}/admin/internal/trends`),
      serviceCall.get(`${SERVICES.DRIVER}/admin/internal/drivers/pending`)
    ]);

    const authStats = authRes.status === 'fulfilled' ? authRes.value.data : {};
    const rideStats = rideRes.status === 'fulfilled' ? rideRes.value.data : {};
    const driverStats = driverRes.status === 'fulfilled' ? driverRes.value.data : {};
    const trends = trendsRes.status === 'fulfilled' ? trendsRes.value.data : [];
    const pendingDrivers = pendingRes.status === 'fulfilled' ? pendingRes.value.data : [];

    const stats = {
      totalUsers: authStats.totalUsers || 0,
      activeDrivers: driverStats.onlineDrivers || 0,
      liveRides: rideStats.activeRides || 0,
      totalRevenue: rideStats.totalRevenue || 0,
      completedRides: rideStats.completedRides || 0,
      pendingReviewCount: driverStats.pendingReviewCount || 0,
      trends: trends,
      recentAlerts: pendingDrivers.slice(0, 5).map(d => ({
        id: d._id,
        type: 'DRIVER_VERIFICATION',
        title: 'New driver verification pending',
        message: `Driver ID: ${d.userId} (${d.fullname?.firstname || 'New Driver'})`,
        timestamp: d.updatedAt || new Date()
      })),
      health: {
        auth: authRes.status === 'fulfilled',
        ride: rideRes.status === 'fulfilled',
        driver: driverRes.status === 'fulfilled'
      }
    };
    res.json(stats);
  } catch (err) {
    handleServiceError(res, err, "Error fetching platform analytics");
  }
});

module.exports = router;
