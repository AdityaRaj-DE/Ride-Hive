import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { emitAcceptRide } from "../sockets/driverRideSocket";
import api from "../api/axios";

export default function Dashboard() {
  const { availableRides, activeRide } = useSelector(
    (s: RootState) => s.driverRide
  );

  const markArriving = async () => {
    if (!activeRide?._id) return;
    await api.post(`/ride/${activeRide._id}/arriving`);
  };

  const startRide = async () => {
    if (!activeRide?._id) return;
    await api.post(`/ride/${activeRide._id}/start`);
  };

  const completeRide = async () => {
    if (!activeRide?._id) return;
    await api.post(`/ride/${activeRide._id}/complete`, {
      finalPrice: 200,
    });
  };

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
          <button onClick={markArriving}>Mark Arriving</button>
          <button onClick={startRide}>Start Ride</button>
          <button onClick={completeRide}>Complete Ride</button>
        </>
      )}
    </div>
  );
}
