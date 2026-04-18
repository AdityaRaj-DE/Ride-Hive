const axios = require("axios");
const urls = require("../utils/serviceUrls");

async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const { data } = await axios.get(`${urls.auth}/me`, {
      headers: { Authorization: token },
    });

    // IMPORTANT: Auth returns user directly (not data.user)
    console.log("Gateway Auth Success - User ID:", data.id);
    req.user = {
      id: data.id,
      roles: data.roles,
      activeRole: data.activeRole,
      onboarding: data.onboarding,
    };

    req.accessToken = token;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

const requireRider = (req, res, next) => {
  if (req.user.activeRole !== "rider") return res.status(403).json({ message: "Requires rider" });
  if (!req.user.onboarding?.rider) return res.status(403).json({ message: "Rider not onboarded" });
  next();
};

const requireDriver = (req, res, next) => {
  if (req.user.activeRole !== "driver") return res.status(403).json({ message: "Requires driver" });
  if (!req.user.onboarding?.driver) return res.status(403).json({ message: "Driver not onboarded" });
  next();
};

module.exports = { authenticate, requireRider, requireDriver };
