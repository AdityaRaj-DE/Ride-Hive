import { emitAcceptRide } from "../sockets/driverRideSocket";
import { Zap, Users, ChevronRight, Activity, Clock, Navigation } from 'lucide-react';

export default function IncomingRequestCard({ ride }: { ride: any }) {
  if (!ride) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[95%] max-w-xl glass-card p-6 sm:p-10 border-accent/20 shadow-xl backdrop-blur-xl z-[100] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-emerald-400 to-accent animate-gradient"></div>
      
      {/* Background Ornament */}
      <div className="absolute -right-8 -top-8 opacity-[0.05] rotate-12 pointer-events-none">
         <Zap className="w-48 h-48 text-accent" />
      </div>

      <header className="flex items-center justify-between gap-4 mb-8 relative z-10">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-accent">New Request</p>
               <h3 className="text-xl font-bold tracking-tight text-primary">Incoming Passenger</h3>
            </div>
         </div>
         
         {ride.rideType === "POOL" && (
            <div className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
               <Users className="w-4 h-4" />
               Shared Pool
            </div>
         )}
      </header>

      <div className="space-y-6 mb-10 relative z-10">
         <div className="flex items-start gap-4">
            <div className="mt-1 w-2.5 h-2.5 rounded-full bg-accent"></div>
            <div className="min-w-0">
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Pickup</p>
               <p className="text-sm font-semibold text-primary truncate leading-tight">{ride.pickup?.label || "Location"}</p>
            </div>
         </div>

         <div className="flex items-start gap-4">
            <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <div className="min-w-0">
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Dropoff</p>
               <p className="text-sm font-semibold text-primary truncate leading-tight">{ride.drop?.label || "Location"}</p>
            </div>
         </div>
         
         <div className="pt-6 border-t border-border flex justify-between items-end">
            <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Estimated Fare</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-accent">₹{ride.price || ride.fare}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted opacity-40">Net Earnings</span>
               </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-muted-foreground opacity-40 text-[9px] font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" /> 4 min away
               </div>
               <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3" /> 1.2 km
               </div>
            </div>
         </div>
      </div>

      <button
        onClick={() => emitAcceptRide(ride.rideId || ride._id)}
        className="btn-primary w-full h-16 text-base gap-4"
      >
        <span>Accept Trip Request</span>
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
