const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_EXPIRES = "15m";
const REFRESH_DAYS = 60;

function signAccessToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      mobileNumber: user.mobileNumber,
      activeRole: user.activeRole,
    },
    process.env.JWT_SECRET || "goodkeymustchange",
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
