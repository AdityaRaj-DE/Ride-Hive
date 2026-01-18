const Rider = require("../models/riderModel");


module.exports.onboard = async (req, res) => {
  const userId = req.user.id;
  const { name, email, emergencyContact, savedLocations, preferences } = req.body;

  if (!name?.first) {
    return res.status(400).json({ message: "First name required" });
  }

  const rider = await Rider.findOneAndUpdate(
    { userId },
    {
      $set: {
        name: { first: name.first, last: name.last || "" },
        email: email || "",
        emergencyContact: emergencyContact || {},
        savedLocations: savedLocations || undefined,
        preferences: preferences || undefined,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  /**
   * Microservices problem:
   * Auth service doesn't know rider onboarding is complete.
   * So we must update auth service flag.
   */
  // TODO: Call Auth service to set onboarding flag:
  // await authClient.patch(`/auth/users/${userId}/onboarding`, { riderOnboarded: true });

  return res.status(200).json({ message: "Rider onboarded", rider });
};


// Create or update rider profile (called from Auth Service)
exports.createOrUpdateRider = async (req, res) => {
  try {
    const userId = req.user?.id; // ✅ take userId from token payload

    if (!userId) {
      return res.status(400).json({ message: "User ID missing from token" });
    }

    const { preferredPayment, savedLocations } = req.body || {};

    let rider = await Rider.findOne({ userId });

    if (rider) {
      rider.preferredPayment = preferredPayment || rider.preferredPayment;
      rider.savedLocations = savedLocations || rider.savedLocations;
      await rider.save();
    } else {
      rider = await Rider.create({ userId, preferredPayment, savedLocations });
    }

    res.status(200).json({
      message: "Rider profile created/updated successfully",
      rider,
    });
  } catch (error) {
    console.error("❌ Error in createOrUpdateRider:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get rider profile
exports.getRiderProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const rider = await Rider.findOne({ userId });

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    res.status(200).json(rider);
  } catch (error) {
    console.error("❌ Error in getRiderProfile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};