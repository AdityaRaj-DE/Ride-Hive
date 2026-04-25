const axios = require("axios");
const urls = require("../utils/serviceUrls");

exports.findNearbyDrivers = async (pickup, radius = 3000, passengers = 1) => {
  try {
    const { data } = await axios.get(`${urls.driver}/nearby`, {
      params: {
        lng: pickup.lng,
        lat: pickup.lat,
        radius,
        passengers,
      },
    });

    return data; // array of drivers
  } catch (err) {
    console.error("findNearbyDrivers error:", err.message);
    return [];
  }
};
