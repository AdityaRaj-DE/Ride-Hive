const axios = require("axios");

exports.getRoute = async (pickup, drop) => {
  const url = `http://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;

  const { data } = await axios.get(url);

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No route found");
  }

  const route = data.routes[0];

  return {
    distance: route.distance, // meters
    duration: route.duration, // seconds
    geometry: route.geometry, // geojson
  };
};
