// services/match.service.js

exports.isMatch = (pool, pickup, drop) => {
  // 1. Basic capacity check
  if (pool.availableSeats <= 0) return { matched: false };

  // 2. Coordinate extraction
  const [pLng, pLat] = pool.route[0].location.coordinates;
  const riderPickupCoords = pickup.lng !== undefined ? [pickup.lng, pickup.lat] : pickup.coordinates;
  const [rLng, rLat] = riderPickupCoords;

  // 3. Distance Heuristic (Euclidean approx)
  // 0.1 deg is ~11km. We use 10km as a reasonable limit for even considering a pool.
  const distance = Math.sqrt(
    Math.pow(pLat - rLat, 2) + Math.pow(pLng - rLng, 2)
  );

  if (distance > 0.1) {
    return { matched: false };
  }

  // 4. Detour Logic (Simplified for matching phase)
  // A match is viable if the rider's pickup is "on the way" or reasonably close to the start.
  // Real reordering and final detour validation happens in ride_service during the 'add' phase.
  
  return { 
    matched: true, 
    score: distance, 
    matchingPoolId: pool._id 
  };
};