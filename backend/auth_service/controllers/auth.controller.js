const crypto = require("crypto");
const Otp = require("../models/otp");
const Session = require("../models/session");
const userService = require("../services/user.service");
const tokenService = require("../services/token.service");
const userModel = require("../models/user");
const axios = require("axios");

// OTP generation
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// integrate SMS provider here
async function sendSmsOtp(mobileNumber, otp) {
  console.log(`OTP for ${mobileNumber}: ${otp}`);
  
  // Send to Admin Service
  try {
    const adminUrl = process.env.ADMIN_SERVICE_URL || "http://localhost:3009";
    await axios.post(`${adminUrl}/admin/otps`, {
      type: "LOGIN",
      target: mobileNumber,
      code: otp,
      service: "auth_service"
    });
  } catch (err) {
    console.error("Failed to sync OTP with admin service:", err.message);
  }
}

/**
 * POST /auth/otp/send
 * body: { mobileNumber }
 */
module.exports.sendOtp = async (req, res) => {
  const { mobileNumber } = req.body;

  if (!mobileNumber)
    return res.status(400).json({ message: "mobileNumber is required" });

  const otp = generateOtp();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 min expiry

  await Otp.create({ mobileNumber, otpHash, expiresAt });

  await sendSmsOtp(mobileNumber, otp);

  return res.status(200).json({ message: "OTP sent" });
};

/**
 * POST /auth/otp/verify
 * body: { mobileNumber, otp, deviceId, requestedRole? }
 *
 * requestedRole: "rider" | "driver"
 * - OPTIONAL
 * - used if you want to automatically set activeRole during login
 */
module.exports.verifyOtp = async (req, res) => {
  const { mobileNumber, otp, deviceId, requestedRole } = req.body;

  if (!mobileNumber || !otp || !deviceId) {
    return res
      .status(400)
      .json({ message: "mobileNumber, otp, deviceId required" });
  }

  // latest otp
  const otpDoc = await Otp.findOne({ mobileNumber, consumed: false }).sort({
    createdAt: -1,
  });

  if (!otpDoc) return res.status(400).json({ message: "OTP not found" });
  if (otpDoc.expiresAt < new Date())
    return res.status(400).json({ message: "OTP expired" });
  if (otpDoc.attempts >= 5)
    return res.status(429).json({ message: "Too many attempts" });

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  if (otpHash !== otpDoc.otpHash) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpDoc.consumed = true;
  await otpDoc.save();

  // user find/create
  const user = await userService.findOrCreateUserByMobile({ mobileNumber });

  user.isVerified = true;

  // 🛡️ Temporary Auto-Promotion for Admin Console access
  if (mobileNumber === "9999999999") {
    user.roles.admin = true;
    user.activeRole = "admin";
  }

  // ✅ Decide activeRole:
  // If requestedRole is driver but user isn't driver yet -> onboarding required
  if (requestedRole === "driver" && user.roles.driver) user.activeRole="driver";
  else if (mobileNumber !== "9999999999") user.activeRole="rider";
  
  await user.save();

  // Create tokens
  const accessToken = tokenService.signAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken();

  await Session.create({
    user: user._id,
    deviceId,
    refreshTokenHash: Session.hashToken(refreshToken),
    revoked: false,
    expiresAt: tokenService.refreshExpiryDate(),
  });

  return res.status(200).json({
    message: "Login success",
    user: {
      id: user._id,
      mobileNumber: user.mobileNumber,
      roles: user.roles,
      activeRole: user.activeRole,
      onboarding: user.onboarding,

      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  });
};

/**
 * POST /auth/refresh
 * body: { refreshToken, deviceId }
 */
module.exports.refresh = async (req, res) => {
  const { refreshToken, deviceId } = req.body;

  if (!refreshToken || !deviceId)
    return res.status(400).json({ message: "refreshToken & deviceId required" });

  const refreshTokenHash = Session.hashToken(refreshToken);

  const session = await Session.findOne({
    deviceId,
    refreshTokenHash,
    revoked: false,
    expiresAt: { $gt: new Date() },
  }).populate("user");

  if (!session) return res.status(401).json({ message: "Invalid refresh token" });

  // rotate refresh token
  const newRefreshToken = tokenService.generateRefreshToken();
  session.refreshTokenHash = Session.hashToken(newRefreshToken);
  session.expiresAt = tokenService.refreshExpiryDate();
  await session.save();

  const accessToken = tokenService.signAccessToken(session.user);

  return res.status(200).json({
    accessToken,
    refreshToken: newRefreshToken,
  });
};

/**
 * POST /auth/logout
 * body: { refreshToken, deviceId }
 */
module.exports.logout = async (req, res) => {
  const { refreshToken, deviceId } = req.body;

  if (!refreshToken || !deviceId)
    return res.status(400).json({ message: "refreshToken & deviceId required" });

  const refreshTokenHash = Session.hashToken(refreshToken);

  await Session.updateOne(
    { deviceId, refreshTokenHash },
    { $set: { revoked: true } }
  );

  return res.status(200).json({ message: "Logged out" });
};

/**
 * POST /auth/role/activate
 * body: { userId, role }   role="rider" | "driver"
 *
 * This is for switching UI between rider and driver (same account).
 */
module.exports.activateRole = async (req, res) => {
  console.log("ACTIVATE BODY:", req.body);
console.log("REQ.USER:", req.user);

  const { role } = req.body;

  const userId = req.user.id; // 👈 from JWT

  if (!role) {
    return res.status(400).json({ message: "role required" });
  }

  if (!["rider", "driver"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await userModel.findById(userId);

  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.roles[role]) {
    user.roles[role] = true;
  }
  

  user.activeRole = role;
  await user.save();

  return res.status(200).json({
    message: "Role activated",
    activeRole: user.activeRole,
  });
};

module.exports.me = async (req, res) => {
  const user = await userModel.findById(req.user.id).lean();

  if (!user) return res.status(404).json({ message: "User not found" });
  
  return res.status(200).json({
    id: user._id.toString(),
    mobileNumber: user.mobileNumber,
    roles: user.roles,
    activeRole: user.activeRole,
    onboarding: user.onboarding,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  });
};


module.exports.updateOnboarding = async (req, res) => {
  const { userId } = req.params;
  const { rider, driver, enableDriverRole } = req.body;

  const user = await userModel.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // ✅ update onboarding flags
  if (typeof rider === "boolean") user.onboarding.rider = rider;
  if (typeof driver === "boolean") user.onboarding.driver = driver;

  // ✅ optional but recommended: enable driver role only when driver service confirms approval
  if (enableDriverRole === true) {
    user.roles.driver = true;
  }

  await user.save();

  return res.status(200).json({
    message: "Onboarding updated",
    user: {
      id: user._id,
      mobileNumber: user.mobileNumber,
      roles: user.roles,
      activeRole: user.activeRole,
      onboarding: user.onboarding,
    },
  });
};

module.exports.getUserByIdInternal = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 [Auth Internal] User lookup: ${userId}`);
    
    const user = await userModel.findById(userId).lean();
    if (!user) {
      console.warn(`⚠️ [Auth Internal] User not found: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ [Auth Internal] Found user mobile: ${user.mobileNumber}`);
    return res.status(200).json({
      id: user._id.toString(),
      mobileNumber: user.mobileNumber,
      roles: user.roles,
      activeRole: user.activeRole,
      onboarding: user.onboarding,
      isVerified: user.isVerified,
      walletBalance: user.walletBalance,
    });
  } catch (err) {
    console.error("❌ [Auth Internal] Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.updateWalletInternal = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, action } = req.body; // action: 'add' or 'deduct'

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (action === "add") {
      user.walletBalance += amount;
    } else if (action === "deduct") {
      if (user.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      user.walletBalance -= amount;
    }

    await user.save();
    console.log(`💰 [Auth Internal] Wallet ${action} for ${userId}: ${amount}. New balance: ${user.walletBalance}`);

    return res.status(200).json({
      message: "Wallet updated",
      walletBalance: user.walletBalance,
    });
  } catch (err) {
    console.error("❌ updateWalletInternal error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ============================
// 🔹 ADMIN INTERNAL
// ============================

exports.getUserStatsInternal = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const riderCount = await userModel.countDocuments({ "roles.rider": true });
    const driverCount = await userModel.countDocuments({ "roles.driver": true });
    res.json({ totalUsers, riderCount, driverCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.internalDbGet = async (req, res) => {
  try {
    const { collection } = req.params;
    let data;
    if (collection === "users") {
      data = await userModel.find().limit(50).lean();
    } else if (collection === "otps") {
      data = await Otp.find().sort({ createdAt: -1 }).limit(50).lean();
    } else {
      return res.status(400).json({ message: "Unsupported" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.internalDbUpdate = async (req, res) => {
  try {
    const { collection, id } = req.params;
    if (collection !== "users") return res.status(400).json({ message: "Unsupported" });
    const data = await userModel.findByIdAndUpdate(id, req.body, { new: true });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};