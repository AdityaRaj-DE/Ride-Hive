const jwt = require("jsonwebtoken");

/**
 * Extract token from:
 * 1) Cookie: token
 * 2) Header: Authorization: Bearer <token>
 */
function extractToken(req) {
  // cookie token
  if (req.cookies?.token) return req.cookies.token;

  // header token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
}

/**
 * Main auth middleware
 */
function protect(req, res, next) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET missing in env");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ normalize id always
    req.user = {
      ...decoded,
      id: decoded.id || decoded.sub || decoded._id,
    };

    if (!req.user.id) {
      return res.status(401).json({
        message: "Unauthorized: invalid token payload (missing id)",
      });
    }

    next();
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid token";

    return res.status(401).json({ message: msg });
  }
}

/**
 * Role/ActiveRole guard middleware
 * Usage: router.post("/route", protect, requireActiveRole("rider"), handler)
 */
function requireActiveRole(role) {
  return (req, res, next) => {
    if (!req.user?.activeRole) {
      return res.status(403).json({ message: "Forbidden: missing activeRole" });
    }

    if (req.user.activeRole !== role) {
      return res.status(403).json({
        message: `Forbidden: activeRole must be ${role}`,
      });
    }

    next();
  };
}

/**
 * Optional: allow only if user has role enabled in Auth service roles
 * NOTE: this works only if you include roles in JWT payload.
 * Currently your token does NOT include roles.
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user?.roles) {
      return res.status(403).json({ message: "Forbidden: roles not present in token" });
    }

    if (!req.user.roles[role]) {
      return res.status(403).json({ message: `Forbidden: requires ${role} role` });
    }

    next();
  };
}

module.exports = {
  protect,
  requireActiveRole,
  requireRole,
};
