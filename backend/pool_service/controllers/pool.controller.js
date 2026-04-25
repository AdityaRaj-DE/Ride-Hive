const axios = require("axios");
const urls = require("../utils/serviceUrls");
const { isMatch } = require("../services/match.service");

exports.requestPool = async (req, res) => {
  try {
    const { pickup, drop } = req.body;
    const token = req.headers.authorization;

    if (!pickup || !drop) {
      return res.status(400).json({ error: "Pickup and Drop locations are required" });
    }

    // 1. Fetch available pools from ride_service
    let candidatePools = [];
    try {
      const { data } = await axios.get(`${urls.ride}/pool/available`, {
        headers: { Authorization: token }
      });
      candidatePools = data || [];
    } catch (err) {
      console.warn("Failed to fetch available pools from ride_service:", err.message);
    }

    // 2. Find best match
    let bestMatch = null;
    let lowestScore = Infinity;

    for (let pool of candidatePools) {
      const matchResult = isMatch(pool, pickup, drop);
      if (matchResult.matched && matchResult.score < lowestScore) {
        bestMatch = pool;
        lowestScore = matchResult.score;
      }
    }

    // 3. Join existing pool if found
    if (bestMatch) {
      console.log(`🎯 Joining existing pool: ${bestMatch._id}`);
      try {
        const { data } = await axios.post(
          `${urls.ride}/pool/${bestMatch._id}/add`,
          { pickup, drop },
          { headers: { Authorization: token } }
        );
        return res.json({
          message: "Joined existing pool successfully",
          ride: data
        });
      } catch (err) {
        console.error("Failed to add rider to pool:", err.response?.data || err.message);
        // Fallback to creating a new pool if joining fails
      }
    }

    // 4. Create new pool if no match or joining failed
    console.log("🆕 Creating new pool ride");
    const { data } = await axios.post(
      `${urls.ride}/pool/create`,
      { pickup, drop },
      { headers: { Authorization: token } }
    );

    return res.json({
      message: "Created new pool successfully",
      ride: data
    });
  } catch (err) {
    console.error("requestPool error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};