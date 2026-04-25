const axios = require("axios");

/**
 * Fetches a route between two or more points.
 * @param {Object|Array} waypoints - Either {lat, lng} or array of {lat, lng}
 */
exports.getRoute = async (waypoints) => {
  let coordsMapping;
  
  if (Array.isArray(waypoints)) {
    coordsMapping = waypoints.map(w => `${w.lng},${w.lat}`).join(";");
  } else {
    coordsMapping = `${waypoints.lng},${waypoints.lat}`; // This shouldn't happen with the new API, but for safety
  }

  // Handle case where we only have one point (invalid for OSRM route)
  if (Array.isArray(waypoints) && waypoints.length < 2) {
    throw new Error("At least two waypoints required for a route");
  }

  const url = `http://router.project-osrm.org/route/v1/driving/${coordsMapping}?overview=full&geometries=geojson`;

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

// Legacy support or helper for simple P2P
exports.getSimpleRoute = async (pickup, drop) => {
    return exports.getRoute([pickup, drop]);
};

