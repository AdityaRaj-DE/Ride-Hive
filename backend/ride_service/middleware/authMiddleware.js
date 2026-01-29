const axios = require("axios");

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) return authHeader.split(" ")[1];
  if (authHeader) return authHeader; // fallback
  return null;
}

exports.protectWithAuthService = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
    if (!AUTH_SERVICE_URL) {
      return res.status(500).json({ message: "AUTH_SERVICE_URL missing" });
    }

    const { data } = await axios.get(`${AUTH_SERVICE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });

    req.user = {
      id: data.id,
      mobileNumber: data.mobileNumber,
      roles: data.roles,
      activeRole: data.activeRole,
      onboarding: data.onboarding,
    };

    req.accessToken = token;

    next();
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      return res.status(401).json({ message: "Unauthorized: invalid/expired token" });
    }

    console.error("❌ Auth validate error:", err.message);
    return res.status(503).json({ message: "Auth service unavailable" });
  }
};

exports.requireActiveRole = (role) => (req, res, next) => {
  if (!req.user?.activeRole) return res.status(403).json({ message: "activeRole missing" });
  if (req.user.activeRole !== role) return res.status(403).json({ message: `Requires activeRole=${role}` });
  next();
};

exports.requireRole = (role) => (req, res, next) => {
  if (!req.user?.roles?.[role]) return res.status(403).json({ message: `Requires role=${role}` });
  next();
};

exports.requireOnboarded = (role) => (req, res, next) => {
  if (!req.user?.onboarding?.[role]) {
    return res.status(403).json({ message: `${role} not onboarded` });
  }
  next();
};
