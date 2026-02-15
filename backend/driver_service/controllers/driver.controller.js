const Driver = require("../models/driverModel");
const axios = require("axios");
const authClient = require("../clients/authClient");
/**
 * Auth Service update call
 */
async function markDriverOnboardedInAuth(userId) {
  try {
    await authClient.patch(
      `/internal/users/${userId}/onboarding`,
      { driver: true },
      { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
    );
  } catch (err) {
    console.error("❌ Failed to update auth onboarding:", err?.response?.data || err.message);
    return res.status(500).json({ message: "Onboarding saved but auth sync failed" });
  }  
}

/**
 * 1) Basic step
 */
module.exports.onboardBasic = async (req, res) => {
  const userId = req.user.id;
  const { firstname, lastname, licenseNumber } = req.body;

  if (!firstname || firstname.length < 3) {
    return res.status(400).json({ message: "firstname required (min 3 chars)" });
  }

  if (!licenseNumber) {
    return res.status(400).json({ message: "licenseNumber required" });
  }

  const driver = await Driver.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        fullname: { firstname, lastname: lastname || "" },
        licenseNumber,
        "onboarding.step": "vehicle",
        status: "draft",
      },
    },
    { upsert: true, new: true }
  );

  return res.status(200).json({
    message: "Driver basic step completed",
    driver,
  });
};

/**
 * 2) Vehicle step
 */
module.exports.onboardVehicle = async (req, res) => {
  const userId = req.user.id;
  const { model, plateNumber, color, type } = req.body;

  if (!model || !plateNumber) {
    return res.status(400).json({ message: "model and plateNumber required" });
  }

  const driver = await Driver.findOne({ userId });
  if (!driver) return res.status(404).json({ message: "Driver profile not found" });

  // step enforcement
  if (driver.onboarding.step !== "vehicle") {
    return res.status(400).json({ message: `Invalid step. Current: ${driver.onboarding.step}` });
  }

  driver.vehicleInfo = { model, plateNumber, color: color || "", type: type || "" };
  driver.onboarding.step = "documents";
  await driver.save();

  return res.status(200).json({ message: "Vehicle details saved", driver });
};

/**
 * 3) Documents step
 * (Assuming frontend uploads docs & sends urls)
 */
module.exports.onboardDocuments = async (req, res) => {
  const userId = req.user.id;
  const { drivingLicenseUrl, rcBookUrl, insuranceUrl, profilePhotoUrl } = req.body;

  const driver = await Driver.findOne({ userId });
  if (!driver) return res.status(404).json({ message: "Driver profile not found" });

  if (driver.onboarding.step !== "documents") {
    return res.status(400).json({ message: `Invalid step. Current: ${driver.onboarding.step}` });
  }

  if (!drivingLicenseUrl || !rcBookUrl || !insuranceUrl || !profilePhotoUrl) {
    return res.status(400).json({ message: "All document urls required" });
  }

  driver.documents.drivingLicense.url = drivingLicenseUrl;
  driver.documents.drivingLicense.uploadedAt = new Date();

  driver.documents.rcBook.url = rcBookUrl;
  driver.documents.rcBook.uploadedAt = new Date();

  driver.documents.insurance.url = insuranceUrl;
  driver.documents.insurance.uploadedAt = new Date();

  driver.documents.profilePhoto.url = profilePhotoUrl;
  driver.documents.profilePhoto.uploadedAt = new Date();

  // after docs upload: go to review
  driver.onboarding.step = "review";
  driver.status = "pending_review";
  await driver.save();

  return res.status(200).json({
    message: "Documents uploaded. Driver moved to review.",
    driver,
  });
};

const PLANS = {
  Weekly: { name: "Weekly", durationDays: 7, price: 199 },
  Monthly: { name: "Monthly", durationDays: 30, price: 499 },
};

function isSubscriptionActive(driver) {
  if (!driver.subscription) return false;
  if (!driver.subscription.isActive) return false;
  if (!driver.subscription.expiresAt) return false;

  return driver.subscription.expiresAt > new Date();
}




// Get driver profile
exports.getDriverProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const driver = await Driver.findOne({ userId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json(driver);
  } catch (error) {
    console.error("❌ Error in getDriverProfile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update driver availability
// Update driver availability (enforce subscription when going online)
exports.updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ error: "isAvailable must be boolean" });
    }

    const driver = await Driver.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // 🧱 If trying to go ONLINE -> check subscription
    if (isAvailable === true && !isSubscriptionActive(driver)) {
      return res.status(403).json({
        message: "Active subscription required to go online",
        code: "SUBSCRIPTION_REQUIRED",
      });
    }

    driver.isAvailable = isAvailable;
    await driver.save();

    res.status(200).json({
      message: "Driver availability updated",
      driver,
    });
  } catch (error) {
    console.error("❌ Error in updateAvailability:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getDriverByUserId = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.params.userId });

    if (!driver) return res.status(404).json({ error: "Driver not found" });

    res.json({
      _id: driver._id,
      userId: driver.userId,
      fullname: driver.fullname,
      vehicle: driver.vehicleInfo,
      rating: driver.rating,
      totalRides: driver.totalRides,
      isAvailable: driver.isAvailable,
      location: driver.location,
      status: driver.status,
    });
  } catch (err) {
    console.error("getDriverByUserId error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ Update driver availability (internal use by Ride Service)
exports.updateDriverStatusByUserId = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ error: "isAvailable must be boolean" });
    }

    const driver = await Driver.findOne({ userId: req.params.userId });
    if (!driver) return res.status(404).json({ error: "Driver not found" });

    driver.isAvailable = isAvailable;
    await driver.save();

    res.json({ success: true, isAvailable: driver.isAvailable });
  } catch (err) {
    console.error("updateDriverStatusByUserId error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ Get nearby available drivers (used by Ride Service)
exports.getNearbyDrivers = async (req, res) => {
  try {
    const { lng, lat, radius = 3000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ error: "lng/lat required" });
    }

    const drivers = await Driver.find({
      isAvailable: true,
      status: "approved", // IMPORTANT
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius),
        },
      },
    })
      .limit(10)
      .lean();

    res.json(drivers);
  } catch (err) {
    console.error("getNearbyDrivers error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "lat and lng must be numbers" });
    }

    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver) return res.status(404).json({ error: "Driver not found" });

    driver.location = { lat, lng };
    await driver.save();

    res.json({ success: true, message: "Location updated" });
  } catch (err) {
    console.error("updateLocation error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};



// controllers/driver.controller.js

// ✅ Earnings
exports.getEarnings = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json({
      totalEarnings: driver.totalEarnings || 0,
      totalRides: driver.totalRides || 0,
    });
  } catch (err) {
    console.error("getEarnings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Ride History (stubbed — normally fetched from Ride Service)
exports.getRideHistory = async (req, res) => {
  try {
    const { driverId } = req.params;
    // In real system, you’d call Ride Service via axios:
    // const { data } = await axios.get(`http://localhost:3004/rides/history/driver/${driverId}`);
    // return res.json(data);

    res.json({
      message: "Integration pending with Ride Service",
      driverId,
      rides: [],
    });
  } catch (err) {
    console.error("getRideHistory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reviews (fetch all reviews or add one)
exports.getReviews = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json(driver.reviews || []);
  } catch (err) {
    console.error("getReviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Toggle online/offline
exports.toggleOnlineStatus = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    driver.isAvailable = !driver.isAvailable;
    await driver.save();

    res.json({
      message: `Driver is now ${driver.isAvailable ? "online" : "offline"}`,
      isAvailable: driver.isAvailable,
    });
  } catch (err) {
    console.error("toggleOnlineStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Average rating
exports.getAverageRating = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const avg =
      driver.reviews && driver.reviews.length
        ? (
            driver.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
            driver.reviews.length
          ).toFixed(2)
        : driver.rating.toFixed(2);

    res.json({ averageRating: parseFloat(avg), totalReviews: driver.reviews.length });
  } catch (err) {
    console.error("getAverageRating error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Trip Summary
exports.getTripSummary = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const summary = {
      driverId: driver._id,
      totalRides: driver.totalRides || 0,
      totalEarnings: driver.totalEarnings || 0,
      rating: driver.rating.toFixed(2),
      averageReviewRating:
        driver.reviews && driver.reviews.length
          ? (
              driver.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
              driver.reviews.length
            ).toFixed(2)
          : driver.rating.toFixed(2),
      recentReviews: driver.reviews.slice(-3),
      onlineStatus: driver.isAvailable,
    };

    res.json(summary);
  } catch (err) {
    console.error("getTripSummary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add Review (used internally by Ride Service or manually)
exports.addReview = async (req, res) => {
  try {
    const { driverId, rideId, userId, rating, comment } = req.body;
    if (!driverId || !rating)
      return res.status(400).json({ message: "driverId and rating are required" });

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    driver.reviews.push({ rideId, userId, rating, comment });
    driver.rating =
      driver.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
      driver.reviews.length;

    await driver.save();
    res.json({ message: "Review added successfully", rating: driver.rating });
  } catch (err) {
    console.error("addReview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDriverByServiceId = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverServiceId);

    if (!driver) return res.status(404).json({ error: "Driver not found" });

    return res.json({
      _id: driver._id,
      userId: driver.userId,
      fullname: driver.fullname,
      mobileNumber: driver.mobileNumber,
      vehicleInfo: driver.vehicleInfo,
      isAvailable: driver.isAvailable,
      location: driver.location,
    });
  } catch (err) {
    console.error("getDriverByServiceId error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

// 💰 Get wallet & subscription info
exports.getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const driver = await Driver.findOne({ userId });

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    return res.json({
      walletBalance: driver.walletBalance,
      subscription: driver.subscription || null,
    });
  } catch (err) {
    console.error("getWallet error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// 💰 Dummy add funds
exports.addFunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      return res
        .status(400)
        .json({ message: "amount must be a positive number" });
    }

    const driver = await Driver.findOne({ userId });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    driver.walletBalance += amt;
    await driver.save();

    return res.json({
      message: "Funds added successfully",
      walletBalance: driver.walletBalance,
    });
  } catch (err) {
    console.error("addFunds error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// 📅 Subscribe to a plan
exports.subscribePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planName } = req.body;

    const plan = PLANS[planName];
    if (!plan) {
      return res.status(400).json({ message: "Invalid planName" });
    }

    const driver = await Driver.findOne({ userId });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    if (driver.walletBalance < plan.price) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
        code: "INSUFFICIENT_FUNDS",
        walletBalance: driver.walletBalance,
        required: plan.price,
      });
    }

    // Deduct
    driver.walletBalance -= plan.price;

    // Activate/renew subscription
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000
    );

    driver.subscription = {
      isActive: true,
      plan,
      startedAt: now,
      expiresAt,
    };

    await driver.save();

    return res.json({
      message: "Subscription activated",
      walletBalance: driver.walletBalance,
      subscription: driver.subscription,
    });
  } catch (err) {
    console.error("subscribePlan error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// For driver app (self)
exports.getOwnSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const driver = await Driver.findOne({ userId });

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    return res.json({
      isActive: isSubscriptionActive(driver),
      subscription: driver.subscription || null,
    });
  } catch (err) {
    console.error("getOwnSubscriptionStatus error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// For Ride Service (by auth userId, NO protect here – internal use)
exports.getSubscriptionStatusForService = async (req, res) => {
  try {
    const { userId } = req.params;
    const driver = await Driver.findOne({ userId });

    if (!driver) {
      return res.json({ isActive: false, subscription: null });
    }

    return res.json({
      isActive: isSubscriptionActive(driver),
      subscription: driver.subscription || null,
    });
  } catch (err) {
    console.error("getSubscriptionStatusForService error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports.approveDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const docs = driver.documents;
    const docsOk =
      docs?.drivingLicense?.url &&
      docs?.rcBook?.url &&
      docs?.insurance?.url &&
      docs?.profilePhoto?.url;

    if (!docsOk) {
      return res.status(400).json({ message: "Driver documents incomplete" });
    }

    driver.status = "approved";
    driver.isAvailable = false;

    driver.verification.licenseVerified = true;
    driver.verification.vehicleVerified = true;
    driver.verification.backgroundCheckPassed = true;
    driver.verification.verifiedAt = new Date();

    driver.onboarding.completed = true;
    driver.onboarding.completedAt = new Date();
    driver.onboarding.step = "done";

    await driver.save();

    // ✅ Auth becomes truth: onboarding + enable driver role
    await markDriverOnboardedInAuth(driver.userId);

    return res.status(200).json({ message: "Driver approved", driver });
  } catch (err) {
    console.error("approveDriver error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};



module.exports.rejectDriver = async (req, res) => {
  const { driverId } = req.params;
  const { reason } = req.body;

  const driver = await Driver.findById(driverId);
  if (!driver) return res.status(404).json({ message: "Driver not found" });

  driver.status = "rejected";
  driver.isAvailable = false;
  driver.onboarding.completed = false;

  await driver.save();

  return res.status(200).json({ message: "Driver rejected", driver });
};
