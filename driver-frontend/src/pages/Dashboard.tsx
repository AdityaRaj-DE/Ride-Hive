import { useSelector } from "react-redux";
import type { RootState } from "../store";
import {
  emitAcceptRide,
  emitDriverArriving,
  emitStartRide,
  emitCompleteRide,
} from "../sockets/driverRideSocket";
import { useState } from "react";

export default function Dashboard() {
  const { availableRides, activeRide } = useSelector(
    (s: RootState) => s.driverRide
  );
  const [otp, setOtp] = useState("");
  return (
    <div style={{ padding: 20 }}>
      <h1>Driver Debug Dashboard</h1>

      <h2>Available Rides</h2>
      {availableRides.map((ride) => (
        <div key={ride.rideId || ride._id}>
          <pre>{JSON.stringify(ride, null, 2)}</pre>
          <button onClick={() => emitAcceptRide(ride.rideId)}>
            Accept Ride
          </button>
        </div>
      ))}

      <h2>Active Ride</h2>
      {activeRide && (
        <>
          <pre>{JSON.stringify(activeRide, null, 2)}</pre>
          <button
            onClick={() =>
              emitDriverArriving(activeRide._id || activeRide.rideId)
            }
          >
            Mark Arriving
          </button>
          <h3>Start Ride (OTP Required)</h3>

          <input
            type="text"
            placeholder="Enter Rider OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              padding: "8px",
              marginRight: "10px",
              width: "120px",
            }}
          />

          <button
            onClick={() =>
              emitStartRide(activeRide._id || activeRide.rideId, otp)
            }
          >
            Start Ride
          </button>
          <button
            onClick={() =>
              emitCompleteRide(activeRide._id || activeRide.rideId)
            }
          >
            Complete Ride
          </button>
        </>
      )}

      {activeRide?.rider && (
        <div>
          <h3>Rider Info</h3>
          <p>Name: {activeRide.rider.name}</p>
          <p>Phone: {activeRide.rider.phone}</p>
        </div>
      )}
    </div>
  );
}