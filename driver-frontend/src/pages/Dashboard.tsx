import { useSelector } from "react-redux";
import type { RootState } from "../store";

import api from "../api/axios";
import {
  emitAcceptRide,
  emitDriverArriving,
  emitStartRide,
  emitCompleteRide,
} from "../sockets/driverRideSocket";


export default function Dashboard() {
  const { availableRides, activeRide } = useSelector(
    (s: RootState) => s.driverRide
  );

  return (
    
    <div style={{ padding: 20 }}>
      <h1>Driver Debug Dashboard</h1>

      <h2>Available Rides</h2>
      {availableRides.map((ride) => (
        <div key={ride.rideId || ride._id}>
          <pre>{JSON.stringify(ride, null, 2)}</pre>
          <button onClick={() => emitAcceptRide(ride.rideId || ride._id)}>
            Accept Ride
          </button>
        </div>
      ))}

      <h2>Active Ride</h2>
      {activeRide && (
        <>
          <pre>{JSON.stringify(activeRide, null, 2)}</pre>

          <button onClick={() => emitDriverArriving(activeRide._id || activeRide.rideId)}>
            Mark Arriving
          </button>

          <button onClick={() => emitStartRide(activeRide._id || activeRide.rideId)}>
            Start Ride
          </button>

          <button onClick={() => emitCompleteRide(activeRide._id || activeRide.rideId)}>
            Complete Ride
          </button>
        </>
      )}
    </div>
  );
}
