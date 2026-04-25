const { createProxyMiddleware } = require("http-proxy-middleware");
const urls = require("../utils/serviceUrls");
const { authenticate, requireRider, requireDriver, requireAdmin } = require("../middleware/auth");

module.exports = function setupProxies(app) {

    app.use(
        "/auth",
        createProxyMiddleware({
          target: urls.auth,
          changeOrigin: true,
          pathRewrite: { "^/auth": "" },
          on: {
            proxyReq: (proxyReq, req, res) => {
              const auth =
                req.headers["authorization"] ||
                req.headers["Authorization"];
                
              if (auth) {
                proxyReq.setHeader("Authorization", auth);
              }
            },
            proxyRes: (proxyRes, req, res) => {
              const cookies = proxyRes.headers["set-cookie"];
              if (cookies) {
                proxyRes.headers["set-cookie"] = cookies.map(c =>
                  c.replace(/; Secure/gi, "").replace(/SameSite=Lax/gi, "SameSite=None")
                );
              }
            }
          }
        })
      );
      
      
      
      // ============================
      // 🔹 RIDER SERVICE
      // ============================
      app.use(
        "/rider",
        authenticate,
        (req, res, next) => {
          if (req.path.startsWith("/onboard")) return next();
          return requireRider(req, res, next);
        },
        createProxyMiddleware({
          target: urls.rider,
          changeOrigin: true,
          pathRewrite: {
            "^/rider": "",
          },
          on: {
            proxyReq: (proxyReq, req, res) => {
              const auth = req.headers.authorization || req.headers.Authorization;
              if (auth) proxyReq.setHeader("Authorization", auth);
            }
          }
        })
      );
      
      
      // ============================
      // 🔹 DRIVER SERVICE
      // ============================
      app.use(
        "/driver",
        authenticate,
        (req, res, next) => {
          // allow onboarding routes without role
          if (req.path.startsWith("/onboard")) return next();
          
          // allow wallet & subscription (so they can pay to finish)
          if (req.path.startsWith("/wallet") || req.path.startsWith("/subscription")) return next();
      
          // allow admin approve
          if (req.path.startsWith("/admin")) return next();
      
          // everything else requires driver role (including onboarding flag check)
          return requireDriver(req, res, next);
        },
        createProxyMiddleware({
          target: urls.driver,
          changeOrigin: true,
          pathRewrite: { "^/driver": "" },
          on: {
            proxyReq: (proxyReq, req, res) => {
              const auth = req.headers.authorization || req.headers.Authorization;
              if (auth) proxyReq.setHeader("Authorization", auth);
            }
          }
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
          pathRewrite: { "^/ride": "" },
          on: {
            proxyReq: (proxyReq, req, res) => {
              proxyReq.setHeader("authorization", req.headers.authorization);
            }
          }
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
          on: {
            proxyReq: (proxyReq, req, res) => {
              console.log(`🔁 [Payment] ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
              const auth = req.headers.authorization || req.headers.Authorization;
              if (auth) proxyReq.setHeader("Authorization", auth);
              if (req.headers.cookie) {
                proxyReq.setHeader("cookie", req.headers.cookie);
              }
            },
            error: (err, req, res) => {
              console.error("❌ [Payment Proxy Error]:", err.message);
              res.status(500).json({ message: "Payment proxy error", error: err.message });
            }
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
          on: {
            proxyReq: (proxyReq, req, res) => {
              console.log(`🔁 [Notification] ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
              if (req.headers.cookie) {
                proxyReq.setHeader("cookie", req.headers.cookie);
              }
            },
            error: (err, req, res) => {
              console.error("❌ [Notification Proxy Error]:", err.message);
              res.status(500).json({ message: "Notification proxy error", error: err.message });
            }
          }
        })
      );

      // ============================
      // 🔹 FEEDBACK SERVICE
      // ============================
      app.use(
        "/feedback",
        authenticate,
        createProxyMiddleware({
          target: urls.feedback,
          changeOrigin: true,
          pathRewrite: { "^/feedback": "" },
          on: {
            proxyReq: (proxyReq, req, res) => {
              // Pass user identity to microservice
              if (req.user && req.user.id) {
                console.log("Setting X-User-ID:", req.user.id);
                proxyReq.setHeader("x-user-id", req.user.id.toString());
              } else {
                console.warn("Gateway Proxy: req.user or req.user.id missing");
              }
              const auth = req.headers.authorization || req.headers.Authorization;
              if (auth) proxyReq.setHeader("Authorization", auth);
            }
          }
        })
      );

      // ============================
      // 🔹 ADMIN SERVICE
      // ============================
      app.use(
        "/admin",
        authenticate,
        requireAdmin,
        createProxyMiddleware({
          target: urls.admin,
          changeOrigin: true,
          on: {
            proxyReq: (proxyReq, req, res) => {
              const auth = req.headers.authorization || req.headers.Authorization;
              if (auth) proxyReq.setHeader("Authorization", auth);
            }
          }
        })
      );

};
