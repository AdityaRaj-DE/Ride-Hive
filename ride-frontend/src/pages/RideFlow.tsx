import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../store";
import NormalRideFlow from "../components/NormalRideFlow";
import PoolRideFlow from "../components/PoolRideFlow";
import RideMap from "../components/RideMap";
import RideCompleted from "../components/RideCompleted";
import FeedbackModal from "../components/FeedbackModal";
import { useEffect, useState } from "react";
import { clearRide } from "../store/rideSlice";
import { Map as MapIcon, Globe, Navigation, ShieldAlert } from 'lucide-react';
import api from "../api/axios";

export default function RideFlow() {
  const dispatch = useDispatch<AppDispatch>();
  const ride = useSelector((s: RootState) => s.ride);
  const { user } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  
  const isFinished = ride.status === "COMPLETED" || 
                     ride.status === "FINISHING" ||
                     ride.riders?.find((r: any) => r.riderId === user?.id)?.status === "DROPPED";
                     
  const [showCompleted, setShowCompleted] = useState(isFinished);

  useEffect(() => {
    if ((ride.status === "COMPLETED" || ride.status === "FINISHING") && !showFeedback && !showCompleted) {
       setShowCompleted(true);
    }
  }, [ride.status, showFeedback, showCompleted]);

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    dispatch(clearRide());
    navigate("/dashboard");
  };

  // Premium Syncing State
  if (!ride.rideId && !showCompleted && !showFeedback) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 animate-pulse"></div>
        <div className="relative z-10 flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
           <div className="text-center">
              <h1 className="text-sm font-black uppercase tracking-[0.4em] text-accent animate-pulse">Establishing Link</h1>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-2">Hive Network Authorization...</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative w-full h-full min-h-[400px] overflow-hidden text-primary bg-background flex flex-col">
      {/* Background Map Layer */}
      <div className="absolute inset-0 z-0">
          <RideMap
            pickup={ride.pickup}
            drop={ride.drop}
            driverLocation={ride.driverLocation}
            geometry={ride.geometry}
            status={ride.status}
            route={ride.route}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/20 via-transparent to-background/40"></div>
      </div>

      {/* UI Overlay Content */}
      <div className="relative z-10 flex-1 flex flex-col">
          {/* Top Status Bar */}
          <nav className="p-4 sm:p-6 flex items-center justify-between pointer-events-none">
             <div className="glass-card px-4 py-2 flex items-center gap-3 pointer-events-auto border-accent/20 shadow-2xl backdrop-blur-3xl">
                <div className={`w-2 h-2 rounded-full ${ride.status === "SEARCHING" ? "bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]"}`}></div>
                <div className="flex flex-col">
                   <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary leading-none">
                      {ride.status || "IDLE"}
                   </h1>
                </div>
             </div>

             <div className="flex items-center gap-2 pointer-events-auto">
                <button 
                  onClick={async () => {
                    if (window.confirm("🚨 EMERGENCY ALERT?")) {
                      try {
                        await api.post("/ride/sos", { rideId: ride.rideId, location: { lat: ride.pickup?.lat, lng: ride.pickup?.lng } });
                        alert("Alert sent.");
                      } catch (err) {
                        alert("Failed to send alert.");
                      }
                    }
                  }}
                  className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg backdrop-blur-md"
                >
                   <ShieldAlert className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-primary border-border hover:bg-surface/50 transition-all active:scale-95 shadow-lg"
                >
                   <MapIcon className="w-5 h-5" />
                </button>
             </div>
          </nav>

          {/* Searching State Overlay */}
          {ride.status === "SEARCHING" && (
            <div className="flex-1 flex flex-col items-center justify-center pointer-events-none pb-20">
               <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-1000">
                  <div className="relative h-40 w-40 flex items-center justify-center">
                     <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
                     <div className="relative z-10 h-20 w-20 glass-card rounded-[2rem] flex items-center justify-center border-accent/30 shadow-2xl backdrop-blur-3xl">
                        <Navigation className="w-8 h-8 text-accent animate-pulse" />
                     </div>
                  </div>
                  <div className="glass-card px-10 py-5 text-center border-accent/20 shadow-2xl backdrop-blur-3xl">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-2">Scanning Matrix</p>
                     <h2 className="text-xl font-bold tracking-tight text-primary">Establishing Connection...</h2>
                     <div className="mt-4 flex items-center justify-center gap-2">
                        {[0,1,2].map(i => (
                           <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 150}ms` }}></div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-32 sm:bottom-10 inset-x-4 pointer-events-none">
            <div className="max-w-xl mx-auto pointer-events-auto">
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                 {ride.rideType === "POOL" ? <PoolRideFlow /> : <NormalRideFlow />}
              </div>
            </div>
          </div>
      </div>

      {/* Global Overlays */}
      {showCompleted && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl animate-in fade-in duration-700">
           <div className="w-full max-w-xl">
              <RideCompleted ride={ride} onDone={() => { setShowCompleted(false); setShowFeedback(true); }} />
           </div>
        </div>
      )}

      {showFeedback && ride.rideId && ride.driverId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
           <div className="w-full max-w-lg">
              <FeedbackModal rideId={ride.rideId as string} driverId={ride.driverId as string} onClose={handleCloseFeedback} />
           </div>
        </div>
      )}
    </div>
  );
}