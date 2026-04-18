import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getSocket } from "../sockets/socketClient";
import useRideCall from "../hooks/useRideCall";
import CallModal from "./CallModal";
import { Phone, ShieldCheck, Navigation } from 'lucide-react';

export default function DriverAssigned() {
  const ride = useSelector((s: RootState) => s.ride);
  const socket = getSocket();
  const { startCall, hangup, acceptIncoming, rejectIncoming, toggleMute, state, timer } = useRideCall(socket, ride.rideId);

  return (
    <>
      <div className="glass-card flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <h2 className="text-lg font-bold text-primary">Driver Assigned</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
            <Navigation className="w-3 h-3" />
            En Route
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-2xl">
              {ride.driver?.name?.charAt(0) || 'D'}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted font-medium mb-1">Your Driver</p>
              <p className="text-xl font-bold text-primary">{ride.driver?.name}</p>
            </div>
            <button 
              onClick={() => startCall({ callerName: "Rider" })}
              className="p-3 bg-accent text-background rounded-full hover:opacity-90 active:scale-95 transition-all"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface rounded-xl border border-border">
              <p className="text-xs text-muted font-medium mb-1">Vehicle</p>
              <p className="text-sm font-bold text-primary">{ride.driver?.vehicle?.model}</p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border">
              <p className="text-xs text-muted font-medium mb-1">Plate Number</p>
              <p className="text-sm font-bold text-accent">{ride.driver?.vehicle?.plateNumber}</p>
            </div>
          </div>
        </div>

        {ride.rideStartOtp && (
          <div className="p-6 bg-accent/[0.03] border border-accent/10 rounded-xl text-center">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Start OTP</p>
            <div className="flex justify-center gap-4">
              {ride.rideStartOtp.code.split('').map((digit, i) => (
                <div key={i} className="w-12 h-16 bg-background border border-border rounded-lg flex items-center justify-center text-3xl font-bold text-primary shadow-sm">
                  {digit}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted font-medium mt-4">
              Share this code with your driver to start the ride.
            </p>
          </div>
        )}

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