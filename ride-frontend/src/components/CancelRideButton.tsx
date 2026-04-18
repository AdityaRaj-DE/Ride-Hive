import { getSocket } from "../sockets/socketClient";
import { XCircle } from 'lucide-react';

export default function CancelRideButton({ rideId }: { rideId: string }) {

  const cancelRide = async () => {
    try {
      const socket = getSocket();

      if (socket) {
        socket.emit("cancelRide", { rideId }, (ack: any) => {
          console.log("cancel ack:", ack);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={cancelRide}
      className="w-full h-16 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive font-bold uppercase tracking-widest hover:bg-destructive hover:text-white transition-all duration-300 flex items-center justify-center gap-4 active:scale-[0.98] group"
    >
      <XCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      <span>Cancel Ride</span>
    </button>
  );
}