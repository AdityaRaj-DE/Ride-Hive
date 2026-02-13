import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { emitCreateRide } from "../sockets/rideSocket";
import { getSocket } from "../sockets/socketClient";
import api from "../api/axios";

export default function Dashboard() {

  const ride = useSelector((s: RootState) => s.ride);
  const [events, setEvents] = useState<string[]>([]);
  console.log("RIDER STATE:", ride);

  // Attach temporary debug listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const log = (msg: string, data?: any) => {
      const entry = `${msg} ${data ? JSON.stringify(data) : ""}`;
      console.log(entry);
      setEvents((prev) => [entry, ...prev]);
    };

    socket.on("ride.restore", (data) => log("ride.restore", data));
    socket.on("ride.assigned", (data) => log("ride.assigned", data));
    socket.on("ride.created", (data) => log("ride.created", data));

    return () => {
      socket.off("ride.restore");
      socket.off("ride.assigned");
      socket.off("ride.created");
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
  
    socket.on("ride.updated", (data) => {
      console.log("🔥 RIDER RECEIVED ride.updated:", data);
    });
  
    return () => {
      socket.off("ride.updated");
    };
  }, []);

  const handleCreateRide = () => {
    emitCreateRide({
      pickup: { lat: 28.61, lng: 77.2 },
      drop: { lat: 28.7, lng: 77.1 },
    });
  };

  const handleJoinRide = () => {
    const socket = getSocket();
    if (!socket || !ride.rideId) return;
    socket.emit("joinRide", { rideId: ride.rideId });
  };

  const handleCancelRide = async () => {
    if (!ride.rideId) return;
    try {
      await api.post(`/ride/${ride.rideId}/cancel`);
      alert("Cancel request sent");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Rider Debug Dashboard</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={handleCreateRide}>Create Dummy Ride</button>
        <button onClick={handleJoinRide} disabled={!ride.rideId}>
          Join Ride Room
        </button>
        <button onClick={handleCancelRide} disabled={!ride.rideId}>
          Cancel Ride
        </button>
      </div>

      <div>
    <h1>Rider Dashboard</h1>

    <h2>Status: {ride.status}</h2>

    {ride.status === "SEARCHING" && <p>🔍 Searching for driver...</p>}

    {ride.status === "DRIVER_ASSIGNED" && <p>🚗 Driver assigned</p>}

    {ride.status === "DRIVER_ARRIVING" && <p>📍 Driver arriving...</p>}

    {ride.status === "IN_PROGRESS" && <p>🛣 Ride in progress</p>}

    {ride.status === "COMPLETED" && <p>✅ Ride completed</p>}
  </div>
    </div>
  );
}
