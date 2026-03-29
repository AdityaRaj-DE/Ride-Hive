import api from "../api/axios";
import { getSocket } from "../sockets/socketClient";

export default function CancelRideButton({ rideId }: any) {

  const cancelRide = async () => {
    try {
      const socket = getSocket();

      socket.emit("cancelRide", { rideId }, (ack: any) => {
        console.log("cancel ack:", ack);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={cancelRide}
      style={{
        marginTop: 20,
        padding: "10px 16px",
        background: "red",
        color: "white"
      }}
    >
      Cancel Ride
    </button>
  );
}