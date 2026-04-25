const { optimizePoolRoute } = require("../ride_service/services/route_optimization.service");

// Mocking axios manually for Node environment
const axios = require("axios");

async function runTest() {
  // Override axios.get
  axios.get = async () => {
    // Indices: 0(Start), 1(R1-P), 2(R1-D), 3(R2-P), 4(R2-D)
    const matrix = [
      [0, 1, 10, 2, 11], // Start to others
      [1, 0, 9, 1, 10],  // R1-P to others
      [10, 9, 0, 8, 1],  // R1-D to others
      [2, 1, 8, 0, 9],   // R2-P to others
      [11, 10, 1, 9, 0]  // R2-D to others
    ];
    return { data: { durations: matrix } };
  };

  const riders = [
    {
      riderId: "R1",
      pickup: { lng: 0, lat: 0 },
      drop: { lng: 10, lat: 10 }
    },
    {
      riderId: "R2",
      pickup: { lng: 1, lat: 1 },
      drop: { lng: 11, lat: 11 }
    }
  ];

  const startPos = { lng: -1, lat: -1 };

  console.log("🚀 Testing Optimization Logic...");
  try {
    const res = await optimizePoolRoute(riders, startPos);
    console.log("✅ Optimized Stops:");
    res.forEach(s => console.log(`   Stop ${s.order}: ${s.type} for ${s.riderId}`));
    
    // Check if R1-P is before R1-D
    const r1p = res.findIndex(s => s.riderId === "R1" && s.type === "PICKUP");
    const r1d = res.findIndex(s => s.riderId === "R1" && s.type === "DROP");
    const r2p = res.findIndex(s => s.riderId === "R2" && s.type === "PICKUP");
    const r2d = res.findIndex(s => s.riderId === "R2" && s.type === "DROP");

    if (r1p !== -1 && r1p < r1d && r2p !== -1 && r2p < r2d) {
      console.log("✅ Precedence constraints satisfied!");
    } else {
      console.error("❌ Precedence constraints FAILED!");
      console.log(`Indices: R1-P:${r1p}, R1-D:${r1d}, R2-P:${r2p}, R2-D:${r2d}`);
    }

  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

runTest();
