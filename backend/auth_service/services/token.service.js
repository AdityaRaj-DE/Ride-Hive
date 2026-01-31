const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_EXPIRES = "180m";
const REFRESH_DAYS = 60;

function signAccessToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      mobileNumber: user.mobileNumber,
      activeRole: user.activeRole,
      roles: user.roles,        // ✅ add this
      onboarding: user.onboarding // ✅ add this too if you want frontend decisions
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}


function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

function refreshExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_DAYS);
  return d;
}

module.exports = { signAccessToken, generateRefreshToken, refreshExpiryDate };
