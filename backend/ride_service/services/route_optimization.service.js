const axios = require("axios");

/**
 * Reorders pool stops to minimize total duration/distance.
 * Brute force search for the optimal permutation of PICKUP and DROP points.
 * 
 * @param {Array} riders - List of riders with { riderId, pickup: { lng, lat }, drop: { lng, lat } }
 * @param {Object} startPos - Initial position (e.g., driver's location or first pickup)
 */
exports.optimizePoolRoute = async (riders, startPos) => {
  // 1. Collect all unique locations
  const locations = [startPos]; // index 0 is start
  const points = []; // { type, riderId, location, originalIndex }

  riders.forEach((r, i) => {
    // Pickup
    points.push({ type: "PICKUP", riderId: r.riderId, location: r.pickup, riderIndex: i });
    locations.push(r.pickup);
    
    // Drop
    points.push({ type: "DROP", riderId: r.riderId, location: r.drop, riderIndex: i });
    locations.push(r.drop);
  });

  // 2. Fetch distance matrix from OSRM
  const coordsStr = locations.map(loc => `${loc.lng},${loc.lat}`).join(";");
  const url = `http://router.project-osrm.org/table/v1/driving/${coordsStr}?annotations=duration`;
  
  let matrix;
  try {
    const { data } = await axios.get(url);
    matrix = data.durations;
  } catch (err) {
    console.error("OSRM Table error:", err.message);
    // Fallback: return stops in original order if optimization fails
    return points.map((p, i) => ({ ...p, order: i }));
  }

  // 3. Brute force permutations with constraints
  let bestSequence = null;
  let minDuration = Infinity;

  const validStops = points.length;
  const picked = new Array(validStops).fill(false);
  const currentSequence = [];

  // Helper check: is a stop valid to add to currentSequence?
  const isValid = (pointIndex) => {
    const p = points[pointIndex];
    if (p.type === "DROP") {
      // Must have picked up this rider already
      const pickupIndex = points.findIndex(pt => pt.riderId === p.riderId && pt.type === "PICKUP");
      const alreadyPickedUp = currentSequence.some(idx => idx === pickupIndex);
      return alreadyPickedUp;
    }
    return true;
  };

  const solve = (currentIndex, currentDuration) => {
    if (currentSequence.length === validStops) {
      if (currentDuration < minDuration) {
        minDuration = currentDuration;
        bestSequence = [...currentSequence];
      }
      return;
    }

    if (currentDuration >= minDuration) return; // Pruning

    for (let i = 0; i < validStops; i++) {
      if (!picked[i] && isValid(i)) {
        picked[i] = true;
        currentSequence.push(i);
        
        // Duration from previous stop (or start) to this stop
        const prevLocIndex = currentSequence.length === 1 ? 0 : currentSequence[currentSequence.length - 2] + 1;
        const thisLocIndex = i + 1;
        const stepDuration = matrix[prevLocIndex][thisLocIndex];

        solve(i, currentDuration + stepDuration);
        
        currentSequence.pop();
        picked[i] = false;
      }
    }
  };

  solve(-1, 0);

  // 4. Transform bestSequence back to stops with order
  return bestSequence.map((idx, order) => ({
    type: points[idx].type,
    riderId: points[idx].riderId,
    location: {
        type: "Point",
        coordinates: [points[idx].location.lng, points[idx].location.lat]
    },
    order: order
  }));
};
