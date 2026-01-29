const { createProxyMiddleware } = require("http-proxy-middleware");
const urls = require("../utils/serviceUrls");
const { authenticate, requireRider, requireDriver } = require("../middleware/auth");

module.exports = function setupProxies(app) {

    app.use(
        "/auth",
        createProxyMiddleware({
          target: urls.auth,
          changeOrigin: true,
          logLevel: "debug",
          onProxyReq(proxyReq, req) {
            const auth =
              req.headers["authorization"] ||
              req.headers["Authorization"];
              
            if (auth) {
              proxyReq.setHeader("Authorization", auth);
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
        "/rider",
        authenticate,
        createProxyMiddleware({
          target: urls.rider,
          changeOrigin: true,
          pathRewrite: {
            "^/rider": "",
          },
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
        (req, res, next) => {
          // allow onboarding routes without role
          if (req.path.startsWith("/onboard")) return next();
      
          // allow admin approve
          if (req.path.startsWith("/admin")) return next();
      
          // everything else requires driver role
          return requireDriver(req, res, next);
        },
        createProxyMiddleware({
          target: urls.driver,
          changeOrigin: true,
          pathRewrite: { "^/driver": "" },
          onProxyReq(proxyReq, req) {
            const auth = req.headers.authorization || req.headers.Authorization;
            if (auth) proxyReq.setHeader("Authorization", auth);
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

};
