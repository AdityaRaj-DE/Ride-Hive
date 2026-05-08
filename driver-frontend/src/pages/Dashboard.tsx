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
import { useNavigate } from "react-router-dom";
import { Zap, ShieldCheck, Activity, Globe, Loader2, Compass } from 'lucide-react';
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

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden text-primary">
      {/* Map Backdrop */}
      <div className="absolute inset-0 z-0">
        <DriverMap 
          driverLocation={currentLocation}
          pickup={activeRide?.pickup || availableRides[0]?.pickup || activeRide?.route?.[0]?.location || availableRides[0]?.route?.[0]?.location}
          drop={activeRide?.drop || availableRides[0]?.drop || activeRide?.route?.[activeRide.route?.length - 1]?.location || availableRides[0]?.route?.[availableRides[0]?.route?.length - 1]?.location}
          status={activeRide?.status}
        />
        {/* Darkening Overlay for Map */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/60 via-transparent to-background/90 transition-opacity duration-700"></div>
      </div>

      {/* Driver Control Overlay */}
      <div className="absolute top-6 inset-x-6 z-40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none">
        {/* Connection Status & Profile Quick Stats */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="glass-card py-3 px-6 flex items-center gap-4 border-accent/10 shadow-2xl">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isOnline ? "bg-accent shadow-[0_0_15px_rgba(59,130,246,0.6)]" : "bg-muted"}`}></div>
              {isOnline && <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-40"></div>}
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted leading-tight">System Status</p>
              <h2 className="text-sm font-bold text-primary">
                {isOnline ? (activeRide ? "Active Mission" : "Intercepting...") : "Terminal Offline"}
              </h2>
            </div>
            <div className="w-px h-8 bg-border/50 mx-2"></div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted leading-tight">Efficiency</p>
              <h2 className="text-sm font-bold text-accent">98%</h2>
            </div>
          </div>
        </div>

        {/* Global Action Button */}
        <div className="w-full sm:w-auto pointer-events-auto">
          <button 
            onClick={handleToggleOnline}
            className={`w-full sm:w-auto h-14 px-8 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-4 active:scale-95 group relative overflow-hidden ${
              isOnline 
                ? "bg-accent text-white shadow-2xl shadow-accent/20 border border-white/10" 
                : "glass-card text-primary border-accent/20 hover:border-accent/40 shadow-xl"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className={`w-5 h-5 ${isOnline ? "fill-current" : "text-accent"}`} />
            )}
            <span>{isOnline ? "Deactivate Link" : "Establish Link"}</span>
            
            {/* Inner glow for online state */}
            {isOnline && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
          </button>
        </div>
      </div>

      {/* Scanning State Overlay - Elevated Design */}
      {!activeRide && availableRides.length === 0 && isOnline && (
         <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none animate-in fade-in duration-1000">
            {/* Background Decorative Blurs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="flex flex-col items-center gap-12 relative">
               <div className="relative h-72 w-72 flex items-center justify-center">
                  {/* Decorative Rings */}
                  <div className="absolute inset-0 border border-accent/10 rounded-full animate-[spin_15s_linear_infinite]"></div>
                  <div className="absolute inset-4 border border-accent/5 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
                  <div className="absolute inset-8 border border-accent/20 rounded-full animate-[spin_10s_linear_infinite] border-dashed opacity-50"></div>
                  
                  {/* Radar Scan Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/5 to-accent/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
                  
                  <div className="relative z-10 h-28 w-28 glass-card rounded-3xl flex items-center justify-center border-accent/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-background/40">
                     <Compass className="w-12 h-12 text-accent animate-spin-slow" />
                  </div>
               </div>
               
               <div className="glass-card px-10 py-8 text-center shadow-2xl space-y-3 max-w-sm border-accent/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent animate-scan text-[0px]">.</div>
                  <div className="flex items-center justify-center gap-3 text-accent mb-1">
                     <Activity className="w-4 h-4 animate-pulse" />
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Quantum Grid Scan</p>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-primary">Awaiting Traversal Requests</h3>
                  <p className="text-secondary text-sm font-medium opacity-70">
                    Proprietary algorithms are filtering optimal nodes for your current vector.
                  </p>
               </div>
            </div>
         </div>
      )}

      {/* Action Panels */}
      <div className="absolute bottom-12 inset-x-4 sm:inset-x-8 z-40 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto flex flex-col gap-8">
          
          {/* New Trip Requests */}
          {!activeRide && availableRides.length > 0 && (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="mb-4 flex items-center gap-3 px-6">
                  <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Neural Intercept: Detected</p>
               </div>
               <IncomingRequestCard ride={availableRides[0]} />
             </div>
          )}

          {/* Active Trip */}
          {activeRide && (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <ActiveRideCard 
                  activeRide={activeRide} 
                  onNavigateToPickup={() => openMapsUrl(activeRide.pickup?.lat, activeRide.pickup?.lng)}
                  onNavigateToDrop={() => openMapsUrl(activeRide.drop?.lat, activeRide.drop?.lng)}
               />
             </div>
          )}
        </div>
      </div>

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

      {/* Footer Meta - Stylized like Rider hub */}
      <div className="fixed bottom-8 right-10 hidden md:flex items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
         {/* Test Controls (Visible only in dev/test) */}
         <div className="pointer-events-auto flex items-center gap-4 bg-background/80 backdrop-blur-md p-2 rounded-xl border border-accent/20 shadow-lg scale-90">
            <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] px-2">Test Mode</p>
            <button 
              onClick={() => {
                const userId = profile?.userId || (profile as any)?._id;
                if (!userId) return alert("Click Establish Link first!");
                // Call internal approve
                api.post(`/driver/admin/internal/drivers/approve/${userId}`).then(() => dispatch(fetchDriverProfile()));
              }}
              className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-[9px] font-bold border border-accent/10 transition-all"
            >
               FORCE APPROVE
            </button>
            <button 
              onClick={() => {
                if (availableRides.length > 0) {
                  const pickup = availableRides[0].pickup;
                  setCurrentLocation({ lat: pickup.lat, lng: pickup.lng });
                  dispatch(updateLocation({ lat: pickup.lat, lng: pickup.lng }));
                } else if (activeRide) {
                  const pickup = activeRide.pickup;
                  setCurrentLocation({ lat: pickup.lat, lng: pickup.lng });
                  dispatch(updateLocation({ lat: pickup.lat, lng: pickup.lng }));
                } else {
                  alert("No ride available to jump to!");
                }
              }}
              className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-[9px] font-bold border border-blue-500/10 transition-all"
            >
               JUMP TO PICKUP
            </button>
         </div>

         <div className="flex items-center gap-3">
            <Globe className="w-3.5 h-3.5 text-accent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Node: Delta-04</p>
         </div>
         <div className="w-[1px] h-4 bg-border/50"></div>
         <div className="flex items-center gap-3">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Hive Integrity: 100%</p>
         </div>
      </div>
    </div>
  );
}