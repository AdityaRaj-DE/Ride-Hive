// services/match.service.js

exports.isMatch = (pool, pickup, drop) => {
  if (pool.availableSeats <= 0) return false;

  const [lng1, lat1] = pool.route[0].location.coordinates;
  const [lng2, lat2] = pickup.coordinates;

  const distance = Math.sqrt(
    Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2)
  );

  return distance < 0.03; // ~3km approx
};