import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { Users, ShieldCheck, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import DriverAssigned from "./DriverAssigned";
import DriverArriving from "./DriverArriving";
import RideStarted from "./RideStarted";
import CancelRideButton from "./CancelRideButton";

export default function PoolRideFlow() {
  const ride = useSelector((s: RootState) => s.ride);
  const { user } = useSelector((s: RootState) => s.auth);
  
  const me = ride.riders?.find((r: { riderId: string; status: string }) => r.riderId === user?.id);
  const myStatus = me?.status || "WAITING";

  // Determine what to show in the main area based on MY status
  // instead of just the global ride status
  const renderPrimaryStatus = () => {
    if (myStatus === "WAITING") {
      if (ride.status === "DRIVER_ASSIGNED") return <DriverAssigned />;
      if (ride.status === "DRIVER_ARRIVING") return <DriverArriving />;
    }
    
    if (myStatus === "PICKED") {
      return <RideStarted />;
    }

    // Default to global if unsure
    if (ride.status === "DRIVER_ASSIGNED") return <DriverAssigned />;
    if (ride.status === "DRIVER_ARRIVING") return <DriverArriving />;
    if (ride.status === "IN_PROGRESS") return <RideStarted />;
    
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Status Hub */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {renderPrimaryStatus()}
      </div>

      {/* Enhanced Shared Manifest */}
      <div className="glass-card p-6 animate-in slide-in-from-bottom-4 duration-700 border-accent/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Users className="w-32 h-32" />
        </div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent ring-1 ring-accent/20">
                <Users className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Shared Manifest</h3>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Hive Network Optimization Active</p>
             </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border">
             <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
             <span className="text-xs font-bold text-accent">{ride.riders?.length || 1} Riders</span>
          </div>
        </div>

        <div className="grid gap-3 relative z-10">
          {ride.riders?.map((r: { riderId: string; status: string }, idx: number) => {
            const isMe = r.riderId === user?.id;
            const statusColor = r.status === "DROPPED" ? "text-muted" : r.status === "PICKED" ? "text-success" : "text-accent";
            const bgAlpha = isMe ? "bg-accent/[0.07]" : "bg-surface/40";
            const borderAlpha = isMe ? "border-accent/20" : "border-border/50";

            return (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${bgAlpha} ${borderAlpha} hover:border-accent/30 group/item`}
              >
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                     r.status === "DROPPED" ? 'bg-surface border-border text-muted' : 
                     r.status === "PICKED" ? 'bg-success/10 border-success/20 text-success' : 
                     'bg-background border-border text-accent ring-1 ring-accent/5'
                   }`}>
                      {r.status === "DROPPED" ? <CheckCircle2 className="w-5 h-5" /> : 
                       r.status === "PICKED" ? <ShieldCheck className="w-5 h-5" /> : 
                       <Clock className="w-5 h-5 animate-pulse" />}
                   </div>
                   
                   <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                         <span className={`text-sm font-bold tracking-tight ${isMe ? 'text-accent' : 'text-primary'}`}>
                           {isMe ? "Your Seat" : `Co-rider ${idx + 1}`}
                         </span>
                         {isMe && (
                            <span className="px-1.5 py-0.5 rounded bg-accent text-[8px] font-bold text-background uppercase">You</span>
                         )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                         <MapPin className={`w-3 h-3 ${statusColor} opacity-50`} />
                         <span className="text-[9px] font-bold text-muted uppercase tracking-widest">{r.status}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   {r.status === "WAITING" && (
                      <div className="flex gap-1">
                         <div className="w-1 h-1 rounded-full bg-accent/40 animate-bounce"></div>
                         <div className="w-1 h-1 rounded-full bg-accent/40 animate-bounce delay-100"></div>
                         <div className="w-1 h-1 rounded-full bg-accent/40 animate-bounce delay-200"></div>
                      </div>
                   )}
                   {r.status === "PICKED" && (
                      <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                   )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-success" />
              Identity Verified
           </div>
           <div className="flex items-center gap-2 text-accent">
              <Clock className="w-3 h-3" />
              Dynamic Route Active
           </div>
        </div>
      </div>

      {/* Cancel Button */}
      {(ride.status === "SEARCHING" || ride.status === "DRIVER_ASSIGNED" || ride.status === "DRIVER_ARRIVING") && ride.rideId && (
        <div className="animate-in fade-in duration-700 delay-500">
           <CancelRideButton rideId={ride.rideId} />
        </div>
      )}
    </div>
  );
}
