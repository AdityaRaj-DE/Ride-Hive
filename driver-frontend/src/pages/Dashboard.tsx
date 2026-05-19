import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchDriverProfile, toggleAvailability, updateLocation } from "../store/slices/driverSlice";
import { clearActiveRide } from "../store/slices/driverRideSlice";
import { startDriverLocationTracking } from "../sockets/driverRideSocket";
import DriverMap from "../components/DriverMap";
import IncomingRequestCard from "../components/IncomingRequestCard";
import ActiveRideCard from "../components/ActiveRideCard";
import FeedbackModal from "../components/FeedbackModal";
import HubFeatureGrid from "../components/HubFeatureGrid";
import RideTypeToggles from "../components/RideTypeToggles";
import { useNavigate } from "react-router-dom";
import { Zap, ShieldCheck, Activity, Globe, Loader2, Compass, Radio, Map as MapIcon, LayoutGrid } from 'lucide-react';
import api from "../api/axios";

interface SubRejectedPayload {
  code?: string;
  message?: string;
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { availableRides, activeRide } = useSelector(
    (s: RootState) => s.driverRide
  );
  const { profile, loading } = useSelector((s: RootState) => s.driver);
  
  const isOnline = profile?.isAvailable || false;
  const [showSubModal, setShowSubModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastRideId, setLastRideId] = useState<string | null>(null);
  const [lastRiderId, setLastRiderId] = useState<string | null>(null);
  
  // Hub States
  const [normalMode, setNormalMode] = useState(true);
  const [poolMode, setPoolMode] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
 
  useEffect(() => {
    if (activeRide) {
       startDriverLocationTracking(activeRide._id || activeRide.rideId);
    }
    
    if (activeRide?.status === "COMPLETED") {
       setLastRideId(activeRide._id || activeRide.rideId);
       setLastRiderId(activeRide.riderId || activeRide.riders?.[0]?.riderId);
       setShowFeedback(true);
    }
  }, [activeRide, activeRide?.status]);

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    dispatch(clearActiveRide());
  };

  useEffect(() => {
    dispatch(fetchDriverProfile());
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error("Location watch error:", err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [dispatch]);

  // Sync location with backend when online
  useEffect(() => {
    if (isOnline && currentLocation) {
      const timer = setTimeout(() => {
        dispatch(updateLocation(currentLocation));
      }, 10000); // sync every 10 seconds
      return () => clearTimeout(timer);
    }
  }, [isOnline, currentLocation, dispatch]);

  const handleToggleOnline = async () => {
    const result = await dispatch(toggleAvailability(!isOnline));
    if (toggleAvailability.rejected.match(result)) {
       const payload = result.payload as SubRejectedPayload;
       if (payload?.code === "SUBSCRIPTION_REQUIRED") {
          setShowSubModal(true);
       }
    }
  };

  const openMapsUrl = (lat?: number, lng?: number) => {
      if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
  };

  const isRideAccepted = !!activeRide && !!activeRide._id && activeRide.status !== "PENDING" && activeRide.status !== "COMPLETED";

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col overflow-hidden text-primary bg-background">
      {/* 
          TACTICAL VIEW (Map Mode) 
          Only visible when a ride is accepted
      */}
      {isRideAccepted && (
        <div className="absolute inset-0 z-0 animate-in fade-in zoom-in-95 duration-700 h-full">
          <DriverMap 
            driverLocation={currentLocation}
            pickup={activeRide?.pickup}
            drop={activeRide?.drop}
            status={activeRide?.status}
          />
          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/40 via-transparent to-background/80"></div>
          
          {/* Tactical Header */}
          <div className="absolute top-6 inset-x-6 z-40 flex items-center justify-between">
            <div className="glass-card px-4 py-2 flex items-center gap-3 border-accent/20">
               <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Active Tactical Link</p>
            </div>
            <button 
              onClick={() => dispatch(clearActiveRide())} // Debug/Fallback
              className="glass-card p-2 text-muted hover:text-primary transition-colors"
            >
               <LayoutGrid className="w-5 h-5" />
            </button>
          </div>

          {/* Active Trip Panel */}
          <div className="absolute bottom-10 inset-x-4 sm:inset-x-8 z-40">
             <div className="max-w-2xl mx-auto">
               <ActiveRideCard 
                  activeRide={activeRide} 
                  onNavigateToPickup={() => openMapsUrl(activeRide.pickup?.lat, activeRide.pickup?.lng)}
                  onNavigateToDrop={() => openMapsUrl(activeRide.drop?.lat, activeRide.drop?.lng)}
               />
             </div>
          </div>
        </div>
      )}

      {/* 
          HUB VIEW (Command Center)
          Visible when NOT in a ride
      */}
      {!isRideAccepted && (
        <div className="w-full h-full overflow-y-auto custom-scrollbar p-mobile-safe relative z-10">
          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
            
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20">
                        <Radio className="w-5 h-5 animate-pulse" />
                     </div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Hive Node Delta-04</p>
                  </div>
                  <h1 className="text-3xl sm:text-6xl font-bold tracking-tight text-primary">
                    Command <span className="text-accent">Center</span>
                  </h1>
               </div>

               <div className="flex items-center gap-4">
                  <button 
                    onClick={handleToggleOnline}
                    className={`h-12 sm:h-16 px-6 sm:px-10 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs transition-all flex items-center justify-center gap-3 sm:gap-4 active:scale-95 group relative overflow-hidden ${
                      isOnline 
                        ? "bg-accent text-white shadow-2xl shadow-accent/20 border border-white/10" 
                        : "glass-card text-primary border-border hover:border-accent/40 shadow-xl"
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className={`w-5 h-5 ${isOnline ? "fill-current" : "text-accent"}`} />
                    )}
                    <span>{isOnline ? "Go Offline" : (window.innerWidth < 640 ? "Connect" : "Establish Link")}</span>
                  </button>
               </div>
            </header>

            {/* Feature Shortcuts */}
            <section className="space-y-6">
               <div className="flex items-center gap-3 opacity-50">
                  <LayoutGrid className="w-4 h-4 text-accent" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">Grid Access</h2>
               </div>
               <HubFeatureGrid />
            </section>

            {/* Ride Mode Toggles */}
            <section className="space-y-6">
               <div className="flex items-center gap-3 opacity-50">
                  <Activity className="w-4 h-4 text-accent" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">Interception Config</h2>
               </div>
               <RideTypeToggles 
                  normalMode={normalMode}
                  poolMode={poolMode}
                  onToggleNormal={() => setNormalMode(!normalMode)}
                  onTogglePool={() => setPoolMode(!poolMode)}
                  isOnline={isOnline}
               />
            </section>

            {/* Scanning / Request Area - High Prominence */}
            <section className="pt-8 relative">
               {isOnline ? (
                  <div className="space-y-8">
                    {/* Persistent Radar Header */}
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-3">
                          <div className="relative">
                             <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                             <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-40"></div>
                          </div>
                          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent animate-pulse">Neural Intercept Link: Active</h2>
                       </div>
                       <div className="flex items-center gap-2 text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
                          <Activity className="w-3 h-3 text-accent" />
                          <span>Scan Rate: 124ms</span>
                       </div>
                    </div>

                    {availableRides.length > 0 ? (
                      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                         <div className="flex items-center gap-3 px-2">
                            <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Neural Intercepts: {availableRides.length} Nodes Detected</p>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableRides.map((ride: any) => (
                               <IncomingRequestCard key={ride.rideId || ride._id} ride={ride} />
                            ))}
                         </div>
                      </div>
                    ) : (
                      <div className="glass-card p-20 text-center border-accent/20 relative overflow-hidden group shadow-[0_0_50px_rgba(59,130,246,0.05)]">
                         {/* Radar Sweep Effect */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/5 to-accent/10 rounded-full animate-[spin_4s_linear_infinite] origin-center scale-150"></div>
                         
                         <div className="relative z-10 space-y-8">
                            <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
                               <div className="absolute inset-0 border border-accent/10 rounded-full animate-[spin_15s_linear_infinite]"></div>
                               <div className="absolute inset-4 border border-accent/5 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
                               <Compass className="w-12 h-12 text-accent animate-pulse" />
                            </div>
                            
                            <div className="space-y-3">
                               <h3 className="text-2xl font-bold text-primary tracking-tighter uppercase">Constant Grid Scan</h3>
                               <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                                 The Hive network is currently analyzing local spatial nodes for optimal intercept opportunities.
                               </p>
                            </div>

                            {/* Scanning Progress Bar */}
                            <div className="w-48 h-1 bg-border/30 mx-auto rounded-full overflow-hidden">
                               <div className="h-full bg-accent animate-[scan_2s_linear_infinite]"></div>
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
               ) : (
                  <div className="glass-card p-16 text-center border-dashed border-border flex flex-col items-center gap-6">
                     <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center text-muted opacity-20">
                        <Zap className="w-10 h-10" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-muted uppercase tracking-tighter">System Idle</h3>
                        <p className="text-sm text-muted/60">Connect to the Hive network to begin interception.</p>
                     </div>
                  </div>
               )}
            </section>
          </div>
        </div>
      )}

      {/* Subscription Modal Overlay */}
      {showSubModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="w-full max-w-lg glass-card p-12 text-center relative overflow-hidden border-accent/20 shadow-2xl">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
              
              <div className="w-24 h-24 rounded-[2rem] bg-accent/10 flex items-center justify-center text-accent mb-10 mx-auto border border-accent/20 shadow-inner">
                <ShieldCheck className="w-12 h-12" />
              </div>
              
              <div className="space-y-4 mb-12">
                 <h2 className="text-4xl font-bold tracking-tight text-primary">Terminal Lockdown</h2>
                 <p className="text-secondary text-base font-medium leading-relaxed max-w-xs mx-auto">
                   Active Clearance (Hive Pro) is required to intercept premium platform traffic.
                 </p>
              </div>

              <div className="flex flex-col gap-4">
                 <button 
                   onClick={() => navigate("/driver/wallet")}
                   className="btn-primary w-full h-16 text-sm tracking-[0.2em]"
                 >
                    UPGRADE CLEARANCE
                 </button>
                 <button 
                   onClick={() => setShowSubModal(false)}
                   className="w-full text-[10px] font-bold uppercase tracking-[0.4em] text-muted hover:text-primary transition-all py-4"
                 >
                    Return to Terminal
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Feedback Overlay */}
      {showFeedback && lastRideId && lastRiderId && (
        <FeedbackModal 
          rideId={lastRideId} 
          riderId={lastRiderId} 
          onClose={handleCloseFeedback} 
        />
      )}

      {/* Test Controls (Fixed at bottom right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-3 bg-background/80 backdrop-blur-md p-2 rounded-xl border border-accent/20 shadow-lg scale-90">
            <button 
              onClick={() => {
                const userId = profile?.userId || (profile as any)?._id;
                if (!userId) return alert("Click Establish Link first!");
                api.post(`/driver/admin/internal/drivers/approve/${userId}`).then(() => dispatch(fetchDriverProfile()));
              }}
              className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-[9px] font-bold border border-accent/10 transition-all"
            >
               FORCE APPROVE
            </button>
         </div>
      </div>
    </div>
  );
}