const axios = require("axios");

function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // Optional cookie support
  if (req.cookies?.token) return req.cookies.token;

  return null;
}

/**
 * This middleware DOES NOT verify JWT locally.
 * It calls Auth Service /auth/me to validate token.
 */
async function protectWithAuthService(req, res, next) {
  try {
    const token = extractToken(req);
    console.log("TOKEN SENT TO AUTH:", token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
    if (!AUTH_SERVICE_URL) {
      return res.status(500).json({ message: "Server misconfigured: AUTH_SERVICE_URL missing" });
    }

    // Call auth service to validate token
    const { data } = await axios.get(`${AUTH_SERVICE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });

    // Attach auth user to req.user (standardized)
    req.user = {
      id: data.id,
      mobileNumber: data.mobileNumber,
      roles: data.roles,
      activeRole: data.activeRole,
      onboarding: data.onboarding,
      isVerified: data.isVerified,
    };

    return next();
  } catch (err) {
    const status = err?.response?.status;

    // auth service says token invalid
    if (status === 401 || status === 403) {
      return res.status(401).json({ message: "Unauthorized: invalid/expired token" });
    }

    // auth service is down
    console.error("❌ Auth service validate error:", err.message);
    return res.status(503).json({ message: "Auth service unavailable" });
  }
}

/**
 * Guards based on role flags from auth service
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user?.roles) return res.status(403).json({ message: "Forbidden: roles missing" });

    if (!req.user.roles[role]) {
      return res.status(403).json({ message: `Forbidden: requires ${role} role` });
    }

    next();
  };
}

/**
 * Guards based on activeRole (UI mode)
 */
function requireActiveRole(role) {
  return (req, res, next) => {
    if (!req.user?.activeRole) return res.status(403).json({ message: "Forbidden: activeRole missing" });

    if (req.user.activeRole !== role && req.user.activeRole !== "admin") {
      return res.status(403).json({ message: `Forbidden: activeRole must be ${role} or admin` });
    }

    next();
  };
}

/**
 * Guards based on onboarding flags
 */
function requireOnboarded(role) {
  return (req, res, next) => {
    if (req.user?.activeRole === "admin") return next();
    
    if (!req.user?.onboarding) {
      return res.status(403).json({ message: "Forbidden: onboarding missing" });
    }

    if (!req.user.onboarding[role]) {
      return res.status(403).json({ message: `${role} onboarding required` });
    }

    next();
  };
}

module.exports = {
  protectWithAuthService,
  requireRole,
  requireActiveRole,
  requireOnboarded,
};
