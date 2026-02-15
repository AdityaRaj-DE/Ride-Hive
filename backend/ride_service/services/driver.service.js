const axios = require("axios");
const urls = require("../utils/serviceUrls");

exports.findNearbyDrivers = async (pickup, radius = 3000) => {
  try {
    const { data } = await axios.get(`${urls.driver}/nearby`, {
      params: {
        lng: pickup.lng,
        lat: pickup.lat,
        radius,
      },
    });

    return data; // array of drivers
  } catch (err) {
    console.error("findNearbyDrivers error:", err.message);
    return [];
  }
};
