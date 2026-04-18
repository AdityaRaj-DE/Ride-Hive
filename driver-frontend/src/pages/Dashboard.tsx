import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchDriverProfile, toggleAvailability } from "../store/slices/driverSlice";
import { clearActiveRide } from "../store/slices/driverRideSlice";
import { startDriverLocationTracking } from "../sockets/driverRideSocket";
import DriverMap from "../components/DriverMap";
import IncomingRequestCard from "../components/IncomingRequestCard";
import ActiveRideCard from "../components/ActiveRideCard";
import FeedbackModal from "../components/FeedbackModal";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Wallet, Bell, ShieldCheck, Activity, Globe, User, Loader2, Compass } from 'lucide-react';

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

  const handleToggleOnline = async () => {
    const result = await dispatch(toggleAvailability(!isOnline));
    if (toggleAvailability.rejected.match(result)) {
       const payload = result.payload as any;
       if (payload?.code === "SUBSCRIPTION_REQUIRED") {
          setShowSubModal(true);
       }
    }
  };

  const openMapsUrl = (lat?: number, lng?: number) => {
      if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden text-primary">
      {/* Map Backdrop */}
      <div className="absolute inset-0 z-0">
        <DriverMap 
          driverLocation={currentLocation}
          pickup={activeRide?.pickup || availableRides[0]?.pickup || activeRide?.route?.[0]?.location || availableRides[0]?.route?.[0]?.location}
          drop={activeRide?.drop || availableRides[0]?.drop || activeRide?.route?.[activeRide.route?.length - 1]?.location || availableRides[0]?.route?.[availableRides[0]?.route?.length - 1]?.location}
          status={activeRide?.status}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/40 via-transparent to-background/80"></div>
      </div>

      {/* Main Header Interface */}
      <nav className="absolute top-6 inset-x-4 sm:inset-x-8 z-40 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link 
              to="/driver/profile"
              className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-primary hover:border-accent/30 transition-all active:scale-95 group overflow-hidden"
            >
               <User className="w-6 h-6 group-hover:text-accent transition-colors" />
            </Link>
            
            <div className="glass-card py-2.5 px-5 flex items-center gap-4 border-accent/10 sm:min-w-[200px]">
               <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-muted"}`}></div>
                  {isOnline && <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-40"></div>}
               </div>
               <div className="flex-1">
                  <h1 className="text-[10px] font-bold uppercase tracking-widest text-primary">Driver Hub</h1>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider">
                     {isOnline ? (activeRide ? "On Trip" : "Active & Ready") : "Currently Offline"}
                  </p>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <button className="hidden sm:flex w-12 h-12 rounded-xl glass-card items-center justify-center text-primary hover:bg-surface/50 transition-all relative">
               <Bell className="w-5 h-5 text-secondary" />
               <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            </button>
            
            <Link 
              to="/driver/wallet" 
              className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-primary hover:bg-surface/50 transition-all"
            >
               <Wallet className="w-5 h-5 text-secondary" />
            </Link>

            <button 
              onClick={handleToggleOnline}
              className={`h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 active:scale-95 group relative overflow-hidden ${
                isOnline 
                  ? "bg-accent text-white shadow-lg shadow-accent/20" 
                  : "glass-card text-primary border-accent/10 hover:border-accent/30"
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className={`w-4 h-4 ${isOnline ? "fill-current" : "text-accent"}`} />
              )}
              <span>{isOnline ? "Go Offline" : "Go Online"}</span>
            </button>
         </div>
      </nav>

      {/* Scanning State Overlay */}
      {!activeRide && availableRides.length === 0 && isOnline && (
         <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none animate-in fade-in duration-700">
            <div className="flex flex-col items-center gap-10">
               <div className="relative h-64 w-64 flex items-center justify-center">
                  <div className="absolute inset-0 border border-accent/10 rounded-full animate-[spin_10s_linear_infinite] border-dashed"></div>
                  <div className="absolute inset-0 bg-accent/[0.03] rounded-full animate-pulse shadow-inner"></div>
                  <div className="relative z-10 h-24 w-24 glass-card rounded-2xl flex items-center justify-center border-accent/20 shadow-xl">
                     <Compass className="w-10 h-10 text-accent animate-spin-slow" />
                  </div>
               </div>
               
               <div className="glass-card px-10 py-6 text-center shadow-xl space-y-2 max-w-sm animate-bounce">
                  <div className="flex items-center justify-center gap-3 text-accent">
                     <Activity className="w-4 h-4" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Grid</p>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-primary">Searching for passengers...</p>
               </div>
            </div>
         </div>
      )}

      {/* Action Panels */}
      <div className="absolute bottom-12 inset-x-4 sm:inset-x-8 z-40 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto flex flex-col gap-8">
          
          {/* New Trip Requests */}
          {!activeRide && availableRides.length > 0 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="mb-4 flex items-center gap-3 px-6 opacity-60">
                  <Bell className="w-4 h-4 text-accent animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">New Transport Request</p>
               </div>
               <IncomingRequestCard ride={availableRides[0]} />
             </div>
          )}

          {/* Active Trip */}
          {activeRide && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
           <div className="w-full max-w-lg glass-card p-10 text-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8 mx-auto border border-accent/20">
                <ShieldCheck className="w-10 h-10" />
              </div>
              
              <div className="space-y-4 mb-10">
                 <h2 className="text-3xl font-bold tracking-tight text-primary">Professional Hub Required</h2>
                 <p className="text-secondary text-sm font-medium leading-relaxed">
                   To keep intercepted trips premium and provide elite traversal nodes, an active Ride-Hive Professional membership is needed.
                 </p>
              </div>

              <div className="flex flex-col gap-4">
                 <button 
                   onClick={() => navigate("/driver/wallet")}
                   className="btn-primary w-full h-14"
                 >
                    Get Active Clearance
                 </button>
                 <button 
                   onClick={() => setShowSubModal(false)}
                   className="w-full text-[10px] font-bold uppercase tracking-widest text-muted hover:text-primary transition-all py-4"
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

      {/* Footer Meta */}
      <div className="fixed bottom-6 right-6 hidden md:flex items-center gap-6 opacity-30">
         <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-accent" />
            <p className="text-[9px] font-bold uppercase tracking-widest">Regional Node Delta-4</p>
         </div>
         <div className="w-px h-3 bg-border"></div>
         <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-accent" />
            <p className="text-[9px] font-bold uppercase tracking-widest">Network Stability: 99.8%</p>
         </div>
      </div>
    </div>
  );
}