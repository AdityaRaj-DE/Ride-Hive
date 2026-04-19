const Rider = require("../models/riderModel");
const authClient = require("../clients/authClient");

module.exports.onboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name?.first) {
      return res.status(400).json({ message: "First name required" });
    }

    const rider = await Rider.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          name: {
            first: name.first,
            last: name.last || "",
          },
          email: email || "",
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    console.log("RIDER INTERNAL KEY:", process.env.INTERNAL_SERVICE_KEY);

    // Sync auth onboarding flag
    await authClient.patch(
      `/internal/users/${userId}/onboarding`,
      { rider: true },
      { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
    );

    res.status(200).json({ rider });
  } catch (err) {
    console.error("❌ Rider onboard failed:", err?.response?.data || err.message);
    res.status(500).json({ message: "Rider onboarding failed" });
  }
};



// Create or update rider profile (called from Auth Service)
exports.getRiderProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const rider = await Rider.findOne({ userId });

    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    // Fetch mobile from auth service
    let mobile = "N/A";
    try {
      const url = `/internal/users/${userId}`;
      console.log(`🔗 [Rider] Fetching mobile from Auth: ${url}`);
      const { data: authUser } = await authClient.get(url, {
        headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY }
      });
      mobile = authUser.mobileNumber;
      console.log(`✅ [Rider] Fetched mobile: ${mobile}`);
    } catch (err) {
      console.warn("❌ [Rider] Failed to fetch mobile from auth:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data
      });
    }

    res.status(200).json({
      rider: {
        ...rider.toObject(),
        mobile
      }
    });
  } catch (err) {
    console.error("❌ getRiderProfile:", err);
    res.status(500).json({ message: "Failed to fetch rider profile" });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const allowedFields = [
      "gender",
      "dob",
      "emergencyContact",
      "savedLocations",
      "preferences",
      "profileImageUrl",
      "name",
      "email",
    ];

    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const rider = await Rider.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    );

    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    res.status(200).json({ rider });
  } catch (err) {
    console.error("❌ updateProfile:", err);
    res.status(500).json({ message: "Failed to update rider profile" });
  }
};


exports.getRiderByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || userId === "undefined") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const rider = await Rider.findOne({ userId });

    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    res.status(200).json({ rider });
  } catch (err) {
    console.error("❌ getRiderByUserId:", err);
    res.status(500).json({ message: "Failed to fetch rider profile" });
  }
};