import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getSocket } from "../sockets/socketClient";
import useRideCall from "../hooks/useRideCall";
import CallModal from "./CallModal";
import { Phone, ShieldCheck, Navigation, MapPin } from 'lucide-react';

export default function RideStarted() {
  const ride = useSelector((s: RootState) => s.ride);
  const socket = getSocket();
  const { startCall, hangup, acceptIncoming, rejectIncoming, toggleMute, state, timer } = useRideCall(socket, ride.rideId);

  return (
    <>
      <div className="glass-card flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <h2 className="text-lg font-bold text-primary">Ride in Progress</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-background bg-accent px-2 py-1 rounded">
            <Navigation className="w-3 h-3" />
            On the way
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-surface rounded-xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                 <MapPin className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs text-muted font-medium mb-0.5">Destination</p>
                 <p className="text-sm font-bold text-primary truncate max-w-[200px]">
                   Ongoing Journey
                 </p>
               </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted font-medium mb-0.5">OTP</p>
              <p className="text-sm font-bold text-accent">{ride.rideStartOtp?.code}</p>
            </div>
          </div>

          <button 
             onClick={() => startCall({ callerName: "Rider" })}
             className="btn-primary w-full h-16 text-lg gap-3"
          >
             <Phone className="w-5 h-5" />
             Call Driver
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-muted-foreground opacity-50">
          <ShieldCheck className="w-3 h-3" />
          <p className="text-[10px] font-medium tracking-wide">Secured by Ride-Hive</p>
        </div>
      </div>

      <CallModal 
        open={state.incoming || state.ringing || state.inCall || state.connecting}
        state={state}
        timerSec={timer.timerSec}
        onAccept={acceptIncoming}
        onReject={rejectIncoming}
        onHangup={hangup}
        onToggleMute={toggleMute}
        roleLabel="Driver"
      />
    </>
  );
}