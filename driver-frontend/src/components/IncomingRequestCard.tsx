import { emitAcceptRide } from "../sockets/driverRideSocket";
import { Zap, Users, ChevronRight, Activity, Clock, Navigation } from 'lucide-react';

export default function IncomingRequestCard({ ride }: { ride: any }) {
  if (!ride) return null;

  return (
    <div className="w-full glass-card p-5 sm:p-8 border-accent/20 shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-accent/40 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-emerald-400 to-accent animate-gradient"></div>
      
      {/* Background Ornament */}
      <div className="absolute -right-4 -top-4 opacity-[0.05] rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-700">
         <Zap className="w-32 h-32 text-accent" />
      </div>

      <header className="flex items-center justify-between gap-4 mb-6 relative z-10">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
               <Activity className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[9px] font-bold uppercase tracking-widest text-accent">Neural Intercept</p>
               <h3 className="text-base sm:text-lg font-bold tracking-tight text-primary">{ride.riderName || "Incoming Passenger"}</h3>
            </div>
         </div>
         
          {ride.rideType === "POOL" ? (
             <div className="px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Shared Pool
             </div>
          ) : (
             <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                {ride.passengers || 1} { (ride.passengers || 1) === 1 ? 'Pax' : 'Pax' }
             </div>
          )}
      </header>

      <div className="space-y-4 mb-8 relative z-10">
         <div className="flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <div className="min-w-0">
               <p className="text-[9px] font-bold uppercase tracking-widest text-muted mb-0.5">Pickup</p>
               <p className="text-sm font-semibold text-primary truncate leading-tight">{ride.pickup?.label || "Location"}</p>
            </div>
         </div>

         <div className="flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
            <div className="min-w-0">
               <p className="text-[9px] font-bold uppercase tracking-widest text-muted mb-0.5">Dropoff</p>
               <p className="text-sm font-semibold text-primary truncate leading-tight">{ride.drop?.label || "Location"}</p>
            </div>
         </div>
         
         <div className="pt-4 border-t border-border flex justify-between items-end">
            <div className="space-y-0.5">
               <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Yield Estimate</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-accent">₹{ride.price || ride.fare || ride.priceEstimate}</span>
               </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-muted-foreground opacity-50 text-[8px] font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" /> 4 min
               </div>
               <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3" /> 1.2 km
               </div>
            </div>
         </div>
      </div>

      <button
        onClick={() => emitAcceptRide(ride.rideId || ride._id)}
        className="h-12 sm:h-14 bg-accent hover:bg-accent/90 text-white rounded-xl w-full flex items-center justify-center font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs transition-all active:scale-95 group shadow-lg shadow-accent/20"
      >
        <span>Accept Request</span>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
