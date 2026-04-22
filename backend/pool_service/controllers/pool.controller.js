const axios = require("axios");
const urls = require("../utils/serviceUrls");
const { isMatch } = require("../services/match.service");

// Dummy findNearbyPools for now
const findNearbyPools = async (pickup) => {
  return []; // Placeholder
};

exports.requestPool = async (req, res) => {
  try {
    const { pickup, drop } = req.body;
    const token = req.headers.authorization;

    // 1. find nearby pools
    const pools = await findNearbyPools(pickup);

    let selectedPool = null;

    for (let pool of pools) {
      if (isMatch(pool, pickup, drop)) {
        selectedPool = pool;
        break;
      }
    }

    // 2. join existing
    if (selectedPool) {
      const { data } = await axios.post(
        `${urls.ride}/pool/${selectedPool._id}/add`,
        { pickup, drop },
        { headers: { Authorization: token } }
      );

      return res.json(data);
    }

    // 3. create new pool
    const { data } = await axios.post(
      `${urls.ride}/pool/create`,
      { pickup, drop },
      { headers: { Authorization: token } }
    );

    return res.json(data);
  } catch (err) {
    console.error("requestPool error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};