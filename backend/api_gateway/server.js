require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const urls = require("./utils/serviceUrls");
const cors = require("cors")
/* ✅ Suppress harmless util._extend deprecation warning */
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  if (typeof warning === "string" && warning.includes("util._extend")) return;
  return originalEmitWarning.call(process, warning, ...args);
};

const app = express();

// Basic logging
app.use(morgan("dev"));
// app.use(express.json());
// Parse CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ["https://localhost:5173", "https://localhost:5174"];

  const axios = require("axios");

/**
 * Validate token + fetch user from Auth service
 */
async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const { data } = await axios.get(`${urls.auth}/me`, {
      headers: { Authorization: token },
    });

    req.user = data.user; // Auth is source of truth
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * Rider onboarding guard
 */
function requireRider(req, res, next) {
  if (!req.user?.onboarding?.rider) {
    return res.status(403).json({ message: "Rider onboarding incomplete" });
  }
  next();
}

/**
 * Driver role + onboarding guard
 */
function requireDriver(req, res, next) {
  if (!req.user?.onboarding?.driver) {
    return res.status(403).json({ message: "Driver onboarding incomplete" });
  }

  if (!req.user?.roles?.driver) {
    return res.status(403).json({ message: "Driver role not enabled" });
  }

  next();
}


app.use(
  cors({
    origin: ["https://localhost:5173", "https://localhost:5174"],  // your React dev server
    credentials: true,                // required for cookies/JWT
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);
// Health check route
app.get("/", (req, res) => res.send("✅ API Gateway is running!"));

// ============================
// 🔹 AUTH SERVICE (Users + Captains)
// ============================
// ============================
// 🔹 AUTH SERVICE (Users + Captains)
// ============================

app.use(
  "/auth",
  createProxyMiddleware({
    target: urls.auth,
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq(proxyReq, req) {
      if (req.headers.authorization) {
        proxyReq.setHeader("authorization", req.headers.authorization);
      }
    },
    onProxyRes(proxyRes) {
      const cookies = proxyRes.headers["set-cookie"];
      if (cookies) {
        proxyRes.headers["set-cookie"] = cookies.map(c =>
          c.replace(/; Secure/gi, "").replace(/SameSite=Lax/gi, "SameSite=None")
        );
      }
    },
  })
);



// ============================
// 🔹 RIDER SERVICE
// ============================
app.use(
  "/rider/onboard",
  authenticate,
  createProxyMiddleware({
    target: urls.rider,
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (auth) proxyReq.setHeader("Authorization", auth);
    },
  })
);

app.use(
  "/rider",
  authenticate,
  requireRider,
  createProxyMiddleware({
    target: urls.rider,
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (auth) proxyReq.setHeader("Authorization", auth);
    },
  })
);


// ============================
// 🔹 DRIVER SERVICE
// ============================
app.use(
  "/driver",
  authenticate,
  requireDriver,
  createProxyMiddleware({
    target: urls.driver,
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      proxyReq.setHeader("authorization", req.headers.authorization);
    },
  })
);

// ============================
// 🔹 RIDE SERVICE
// ============================
app.use(
  "/ride",
  authenticate,
  createProxyMiddleware({
    target: urls.ride,
    changeOrigin: true,
    ws: true,
    onProxyReq(proxyReq, req) {
      proxyReq.setHeader("authorization", req.headers.authorization);
    },
  })
);



// ============================
// 🔹 PAYMENT SERVICE
// ============================
app.use(
  "/payment",
  createProxyMiddleware({
    target: urls.payment,
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: (proxyReq, req) => {
      console.log(`🔁 [Payment] ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
      if (req.headers.cookie) {
        proxyReq.setHeader("cookie", req.headers.cookie);
      }
    },
    onError: (err, req, res) => {
      console.error("❌ [Payment Proxy Error]:", err.message);
      res.status(500).json({ message: "Payment proxy error", error: err.message });
    }
  })
);

// ============================
// 🔹 NOTIFICATION SERVICE
// ============================
app.use(
  "/notification",
  createProxyMiddleware({
    target: urls.notification,
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: (proxyReq, req) => {
      console.log(`🔁 [Notification] ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
      if (req.headers.cookie) {
        proxyReq.setHeader("cookie", req.headers.cookie);
      }
    },
    onError: (err, req, res) => {
      console.error("❌ [Notification Proxy Error]:", err.message);
      res.status(500).json({ message: "Notification proxy error", error: err.message });
    }
  })
);

// Start Gateway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚪 API Gateway running on port ${PORT}`));
