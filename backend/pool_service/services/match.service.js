exports.isMatch = (pool, pickup, drop) => {
  // 1. Basic capacity check
  if (pool.availableSeats <= 0) return { matched: false };

  // 2. Coordinate extraction
  const [pLng, pLat] = pool.route[0].location.coordinates;
  const riderPickupCoords = pickup.lng !== undefined ? [pickup.lng, pickup.lat] : pickup.coordinates;
  const [rLng, rLat] = riderPickupCoords;

  // 3. Distance Heuristic (Euclidean approx)
  const distance = Math.sqrt(
    Math.pow(pLat - rLat, 2) + Math.pow(pLng - rLng, 2)
  );

  // 0.1 deg is ~11km. Threshold for even starting the check
  if (distance > 0.1) {
    return { matched: false };
  }

  // 4. Direction Awareness (Vector Heuristic)
  // Check if rider and pool are traveling in roughly the same direction
  try {
    const riderVector = {
      x: drop.lng - pickup.lng,
      y: drop.lat - pickup.lat
    };

    const poolEnd = pool.route[pool.route.length - 1].location.coordinates;
    const poolVector = {
      x: poolEnd[0] - pLng,
      y: poolEnd[1] - pLat
    };

    const normalize = (v) => {
      const m = Math.sqrt(v.x * v.x + v.y * v.y);
      return m > 0 ? { x: v.x / m, y: v.y / m } : v;
    };

    const rv = normalize(riderVector);
    const pv = normalize(poolVector);

    const dotProduct = rv.x * pv.x + rv.y * pv.y;

    // dotProduct < 0.3 means direction diff > ~70 degrees
    if (dotProduct < 0.3) {
      console.log(`🚫 Direction mismatch (dot: ${dotProduct.toFixed(2)}). Skipping match.`);
      return { matched: false };
    }
  } catch (err) {
    console.warn("Direction check failed:", err.message);
  }

  return { 
    matched: true, 
    score: distance, 
    matchingPoolId: pool._id 
  };
};