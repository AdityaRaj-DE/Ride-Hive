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
import { ShieldCheck, Map as MapIcon, Globe, Navigation, ShieldAlert } from 'lucide-react';
import api from "../api/axios";

export default function RideFlow() {
  const dispatch = useDispatch<AppDispatch>();
  const ride = useSelector((s: RootState) => s.ride);
  const { user } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Initialize based on current status (in case we arrived here via redirect)
  const isFinished = ride.status === "COMPLETED" || 
                     ride.status === "FINISHING" ||
                     ride.riders?.find((r: any) => r.riderId === user?.id)?.status === "DROPPED";
                     
  const [showCompleted, setShowCompleted] = useState(isFinished);

  useEffect(() => {
    console.log("RideFlow Status Sync:", ride.status);
    const me = ride.riders?.find((r: { riderId: string }) => r.riderId === user?.id);
    const myIndividualStatus = me?.status || "WAITING";

    if ((ride.status === "COMPLETED" || ride.status === "FINISHING" || myIndividualStatus === "DROPPED") && !showFeedback && !showCompleted) {
       console.log("🚀 Triggering RideCompleted Overlay - Reason:", ride.status);
       setShowCompleted(true);
       return;
    }

    if (
      !ride.status ||
      ride.status === "CANCELLED_BY_RIDER"
    ) {
      const timer = setTimeout(() => {
        // Only navigate away if we are NOT showing the completion screen
        if (!ride.status && !showCompleted && !showFeedback) {
          navigate("/book-ride");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ride.status, navigate, ride.riders, user, showFeedback, showCompleted]);

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    dispatch(clearRide());
    navigate("/book-ride");
  };

  return (
    <div className="relative w-full h-screen overflow-hidden text-primary">
      {/* Map Background */}
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

      {/* Top Status Bar */}
      <nav className="absolute top-6 inset-x-4 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none">
         <div className="glass-card px-6 py-3 flex items-center gap-4 pointer-events-auto border-accent/10">
            <div className={`w-2.5 h-2.5 rounded-full ${ride.status === "SEARCHING" ? "bg-warning animate-pulse" : "bg-accent"}`}></div>
            <div>
               <h1 className="text-xs font-bold uppercase tracking-widest text-primary">
                  {ride.status === "SEARCHING" ? "Finding Driver" : "Ride Active"}
               </h1>
               <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                 {ride.status === "SEARCHING" ? "Scanning for nearby vehicles..." : "Connected to Ride-Hive Network"}
               </p>
            </div>
         </div>

         <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
            {/* SOS Button */}
            <button 
              onClick={async () => {
                if (window.confirm("🚨 ARE YOU IN AN EMERGENCY? This will alert the Ride-Hive Safety Team and share your live location.")) {
                  try {
                    await api.post("/ride/sos", {
                      rideId: ride.rideId,
                      location: {
                        lat: ride.pickup?.lat, // Should ideally be current GPS, but using pickup/driver for now
                        lng: ride.pickup?.lng
                      }
                    });
                    alert("Emergency alert sent. Help is being dispatched.");
                  } catch (err) {
                    console.error("SOS failed:", err);
                    alert("Failed to send alert. Please call emergency services directly.");
                  }
                }
              }}
              className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center hover:bg-destructive hover:text-white transition-all shadow-lg active:scale-95"
              title="Emergency SOS"
            >
               <ShieldAlert className="w-7 h-7" />
            </button>

            <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-accent border-accent/5 hover:bg-accent/5 transition-colors cursor-help">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <button 
              onClick={() => navigate("/dashboard")}
              className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-primary border-border hover:bg-surface/50 transition-all active:scale-95"
            >
               <MapIcon className="w-6 h-6" />
            </button>
         </div>
      </nav>

      {/* Searching State Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
         {ride.status === "SEARCHING" && (
            <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700">
               <div className="relative h-48 w-48 flex items-center justify-center">
                  <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
                  <div className="relative z-10 h-24 w-24 glass-card rounded-2xl flex items-center justify-center border-accent/20 shadow-xl">
                     <Navigation className="w-10 h-10 text-accent animate-pulse" />
                  </div>
               </div>
               <div className="glass-card px-10 py-6 text-center border-accent/10 shadow-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Searching</p>
                  <p className="text-xl font-bold tracking-tight text-primary">Looking for your driver...</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce delay-100"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce delay-200"></div>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Floating Action Panels */}
      <div className="absolute bottom-12 inset-x-4 sm:inset-x-6 z-30 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto flex flex-col gap-6">
          
          {/* Main Status Components */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             {ride.rideType === "POOL" ? <PoolRideFlow /> : <NormalRideFlow />}
          </div>
        </div>
      </div>

      {/* Global Status Info */}
      <footer className="absolute bottom-4 right-6 z-30 opacity-30 flex items-center gap-2 pointer-events-none">
         <Globe className="w-3 h-3 text-accent" />
         <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Ride-Hive Matrix v2.0</p>
      </footer>

      {/* Ride Completed / Payment Summary Overlay */}
      {showCompleted && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl animate-in fade-in duration-700">
           <div className="w-full max-w-xl">
              <RideCompleted 
                ride={ride} 
                onDone={() => {
                  setShowCompleted(false);
                  setShowFeedback(true);
                }} 
              />
           </div>
        </div>
      )}

      {/* Feedback Modal Overlay */}
      {showFeedback && ride.rideId && ride.driverId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
           <div className="w-full max-w-lg">
              <FeedbackModal 
                rideId={ride.rideId as string} 
                driverId={ride.driverId as string} 
                onClose={handleCloseFeedback} 
              />
           </div>
        </div>
      )}
    </div>
  );
}