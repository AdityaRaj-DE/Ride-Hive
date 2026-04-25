import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { emitAcceptRide, emitUpdatePoolStop } from "../sockets/driverRideSocket";
import { setActiveRide } from "../store/slices/driverRideSlice";
import { 
  Users, 
  Navigation, 
  CheckCircle2, 
  MapPin, 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  ShieldCheck,
  ChevronRight,
  Clock,
  Activity,
  Target,
  Globe,
  Fingerprint,
  Wallet,
  Banknote,
  QrCode
} from 'lucide-react';
import QRCode from "react-qr-code";

export default function RidePool() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeRide } = useSelector((s: RootState) => s.driverRide);
  const [availablePools, setAvailablePools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeRide?.status === "COMPLETED") {
      navigate("/driver/dashboard");
    }
    if (!activeRide) {
      fetchAvailablePools();
    }
  }, [activeRide, navigate]);

  const fetchAvailablePools = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/ride/pool/available");
      setAvailablePools(data);
    } catch (err) {
      console.error("Failed to fetch pools:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPool = (rideId: string) => {
    emitAcceptRide(rideId);
    const ride = availablePools.find((r) => r._id === rideId);
    if (ride) {
      dispatch(setActiveRide(ride));
    }
  };

  const openMapsUrl = (lat?: number, lng?: number) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
  };

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [selectedStop, setSelectedStop] = useState<any>(null);

  const handleUpdateStop = async (stop: any) => {
    setSelectedStop(stop);
    if (stop.type === "PICKUP") {
      setShowOtpModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSelect = (method: "CASH" | "WALLET") => {
    if (activeRide && selectedStop) {
      emitUpdatePoolStop(activeRide._id, selectedStop.order, undefined, method);
      setShowPaymentModal(false);
      setSelectedStop(null);
    }
  };

  const submitOtp = async () => {
    emitUpdatePoolStop(activeRide._id, selectedStop.order, otpInput);
    setShowOtpModal(false);
    setOtpInput("");
    setSelectedStop(null);
  };

  // --- Active Pool View ---
  if (activeRide && activeRide.rideType === "POOL") {
    return (
      <div className="min-h-screen text-primary pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <header className="mb-16 flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Active Service Loop</p>
               </div>
               <h1 className="text-2xl sm:text-4xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
                 Pool <span className="text-accent">Operation</span>
               </h1>
            </div>
            
            <div className="glass-card px-8 py-4 border-accent/10 flex items-center gap-6 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                 <Users className="w-8 h-8" />
              </div>
              <div className="text-left">
                 <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 mb-1">Total Occupancy</p>
                 <p className="text-4xl font-bold text-accent tracking-tighter leading-none">{activeRide.riders.length}<span className="text-muted/20 mx-1">/</span>4</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-8 space-y-4 sm:space-y-8 relative">
                <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/20 via-border to-accent/20"></div>
                
                {activeRide.route?.slice().sort((a: any, b: any) => a.order - b.order).map((stop: any, idx: number) => {
                  const riderNum = activeRide.riders.findIndex((r: any) => r.riderId === stop.riderId) + 1;
                  const rider = activeRide.riders.find((r: any) => r.riderId === stop.riderId);
                  const isCompleted = (stop.type === "PICKUP" && rider?.status !== "WAITING") || (stop.type === "DROP" && rider?.status === "DROPPED");
                  const isActive = !isCompleted && (idx === 0 || ((activeRide.route[idx-1].type === "PICKUP" && activeRide.riders.find((r: any) => r.riderId === activeRide.route[idx-1].riderId)?.status !== "WAITING") || (activeRide.route[idx-1].type === "DROP" && activeRide.riders.find((r: any) => r.riderId === activeRide.route[idx-1].riderId)?.status === "DROPPED")));

                  return (
                    <div key={idx} className="relative">
                      <div className={`absolute left-6.5 top-10 w-3 h-3 rounded-full z-20 border-2 transition-all ${
                        isCompleted ? "bg-accent border-accent" : 
                        isActive ? "bg-background border-accent animate-pulse scale-125" : "bg-background border-border"
                      }`}></div>

                      <div className={`glass-card p-4 sm:p-8 border-accent/5 shadow-lg transition-all ml-12 sm:ml-16 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 ${
                        isCompleted ? "opacity-30 grayscale scale-[0.98]" : 
                        isActive ? "border-accent/20 shadow-accent/5 scale-[1.02]" : "opacity-40"
                      }`}>
                         <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0 w-full">
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border shadow-sm ${
                              stop.type === "PICKUP" ? "bg-accent/5 text-accent border-accent/10" : "bg-rose-500/5 text-rose-500 border-rose-500/10"
                            }`}>
                               {stop.type === "PICKUP" ? <Navigation className="w-6 h-6 sm:w-8 sm:h-8" /> : <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />}
                            </div>

                            <div className="space-y-1">
                               <p className={`text-[10px] font-bold uppercase tracking-widest ${stop.type === "PICKUP" ? "text-accent" : "text-rose-500"}`}>{stop.type} HUB</p>
                               <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-primary uppercase">{rider?.name || `Passenger #${riderNum}`}</h3>
                               <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 truncate max-w-[200px]">LOC: {stop.location.coordinates[1].toFixed(5)}, {stop.location.coordinates[0].toFixed(5)}</p>
                            </div>
                         </div>

                         {!isCompleted && isActive && (
                           <div className="flex items-center gap-4 w-full md:w-auto">
                              <button 
                                onClick={() => openMapsUrl(stop.location.coordinates[1], stop.location.coordinates[0])}
                                className="h-12 w-12 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent/40 transition-all active:scale-90"
                              >
                                <Navigation className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleUpdateStop(stop)}
                                className="h-12 px-6 rounded-xl bg-accent text-white font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 shadow-lg shadow-accent/20"
                              >
                                 <CheckCircle2 className="w-4 h-4" />
                                 Confirm Stop
                              </button>
                           </div>
                         )}
                      </div>
                    </div>
                  );
                })}
             </div>

             <div className="lg:col-span-4 space-y-8">
                <div className="glass-card p-10 border-accent/10 shadow-xl backdrop-blur-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none -rotate-12 translate-x-4">
                      <Target className="w-48 h-48 text-accent" />
                   </div>
                   
                   <header className="mb-8 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                         <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight">Status Terminal</h3>
                   </header>

                   <div className="space-y-6">
                      {[
                        { label: 'Cloud Sync', val: 'Active', color: 'text-accent' },
                        { label: 'Security', val: 'L7 Encrypted', color: 'text-accent' },
                        { label: 'Optimization', val: 'Peak', color: 'text-accent' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted opacity-40">{item.label}</p>
                           <p className={`text-xs font-bold uppercase tracking-widest ${item.color}`}>{item.val}</p>
                        </div>
                      ))}
                   </div>
                   
                   <div className="mt-10 pt-8 border-t border-border">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-20 leading-relaxed mb-6">
                         Orchestrating multi-trajectory routes via regional Hive Hub Alpha.
                      </p>
                      <button className="w-full h-12 rounded-xl bg-surface border border-border text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-4 active:scale-95">
                         Update Feed <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                
                <Link to="/driver/dashboard" className="glass-card p-8 border-border hover:border-accent/40 transition-all flex flex-col items-center justify-center gap-4 rounded-3xl opacity-40 hover:opacity-100 group shadow-lg">
                   <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                   <p className="text-[9px] font-bold uppercase tracking-widest">Dashboard Entry</p>
                </Link>
             </div>
          </div>
        </div>

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/90 backdrop-blur-3xl animate-in fade-in duration-500">
            {/* ... inner OTP content ... */}
            <div className="w-full max-w-2xl glass-card p-12 md:p-16 border-accent/10 shadow-2xl text-center relative overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-500">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-accent"></div>
              
              <div className="w-32 h-32 rounded-3xl bg-accent/5 flex items-center justify-center text-accent mb-12 mx-auto border border-accent/10 group">
                 <ShieldCheck className="w-16 h-16 group-hover:scale-110 transition-transform" />
              </div>

              <div className="space-y-4 mb-8 sm:mb-16">
                 <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-primary leading-tight">Identity <span className="text-accent underline decoration-4 underline-offset-8">Verify</span></h2>
                 <p className="text-secondary font-medium text-[10px] sm:text-base opacity-40 uppercase tracking-widest px-4 sm:px-10">
                   Input the 4-digit code provided by your passenger to authorize stop #{selectedStop?.order}.
                 </p>
              </div>
              
              <div className="max-w-xs mx-auto mb-16">
                <input 
                  type="text" 
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="0000"
                  className="w-full bg-surface border border-border rounded-2xl py-8 text-center text-6xl font-bold tracking-[0.4em] focus:border-accent/40 focus:ring-1 focus:ring-accent/10 outline-none transition-all placeholder:text-muted/10 text-accent"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-6">
                <button 
                  onClick={submitOtp}
                  disabled={otpInput.length < 4}
                  className="btn-primary w-full h-16 text-sm gap-4 disabled:opacity-20 disabled:grayscale"
                >
                   <span>Authorize Pickup</span>
                   <Fingerprint className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => { setShowOtpModal(false); setOtpInput(""); }}
                  className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-rose-500 transition-colors py-2 opacity-40 hover:opacity-100"
                >
                  Cancel Operation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Selection Modal (Pool) */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="glass-card p-8 max-w-md w-full border-accent/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                   <QrCode className="w-24 h-24 text-accent" />
                </div>

                <div className="text-center mb-8">
                   <h3 className="text-2xl font-bold text-primary mb-2">Collect Payment</h3>
                   <p className="text-sm text-secondary font-medium uppercase tracking-widest text-[9px]">Select method for {activeRide.riders?.find((r: any) => r.riderId === selectedStop?.riderId)?.name || 'Passenger'}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-8">
                   <button
                     onClick={() => handlePaymentSelect("WALLET")}
                     className="h-24 rounded-2xl bg-accent/5 border border-accent/20 flex flex-col items-center justify-center gap-2 hover:bg-accent/10 transition-all group"
                   >
                      <Wallet className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                      <div className="text-center">
                         <p className="text-sm font-bold text-primary">In-App Wallet</p>
                         <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Standard Sync</p>
                      </div>
                   </button>

                   <button
                     onClick={() => handlePaymentSelect("CASH")}
                     className="h-24 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center gap-2 hover:bg-background transition-all group"
                   >
                      <Banknote className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <div className="text-center">
                         <p className="text-sm font-bold text-primary">Cash Payment</p>
                         <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Manual Handover</p>
                      </div>
                   </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center gap-4">
                     <div className="p-3 bg-white rounded-xl shadow-lg">
                        <QRCode 
                          value={`ride_hive_pay_${activeRide._id}_stop_${selectedStop?.order}`} 
                          size={120}
                          level="L"
                        />
                     </div>
                     <p className="text-[9px] font-bold text-accent uppercase tracking-widest animate-pulse">Request Payment Scan</p>
                  </div>

                  <button
                    onClick={() => { setShowPaymentModal(false); setSelectedStop(null); }}
                    className="text-[10px] font-bold text-muted uppercase tracking-widest hover:text-primary transition-colors py-2"
                  >
                    Cancel & Return
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // --- Search / Selection View ---
  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-20 flex flex-col md:flex-row items-end justify-between gap-8 text-center md:text-left">
          <div className="space-y-4">
             <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-16 h-16 bg-accent/5 rounded-2xl flex items-center justify-center text-accent border border-accent/10 shadow-sm animate-float">
                   <Search className="w-8 h-8" />
                </div>
                <div className="px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest">Regional Survey Active</span>
                </div>
             </div>
             <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
               Pool <span className="text-accent">Opportunities</span>
             </h1>
             <p className="text-secondary text-base md:text-xl font-medium max-w-3xl mx-auto md:mx-0 opacity-60 leading-relaxed">
               Locating high-yield multi-passenger trajectories within your current regional sector.
             </p>
          </div>
          
          <button 
             onClick={fetchAvailablePools}
             className="h-16 w-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent/40 transition-all active:scale-95 shadow-sm group"
          >
             <RefreshCw className={`w-8 h-8 transition-transform duration-700 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          </button>
        </header>

        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
             <RefreshCw className="w-16 h-16 text-accent animate-spin opacity-20" />
             <div className="space-y-2">
                <p className="text-[12px] font-bold uppercase tracking-widest text-accent animate-pulse">Mapping Hub Nodes</p>
                <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-20">Accessing Regional Grid Matrix 24.0.0</p>
             </div>
          </div>
        ) : availablePools.length === 0 ? (
          <div className="glass-card p-20 md:p-32 border-accent/5 text-center relative overflow-hidden rounded-[3rem] shadow-xl backdrop-blur-xl">
            <div className="w-32 h-32 bg-surface/50 rounded-[2.5rem] mx-auto mb-12 flex items-center justify-center text-muted border border-border shadow-inner">
               <Clock className="w-16 h-16 opacity-10" />
            </div>
            <h2 className="text-5xl font-bold uppercase tracking-tight text-primary mb-6">Zero <span className="text-accent">Activity</span></h2>
            <p className="text-secondary text-lg font-medium opacity-40 max-w-lg mx-auto uppercase tracking-widest leading-loose mb-12">
              No pool streams detected in your sector. Expand your perimeter or refresh the survey terminal.
            </p>
            <button 
               onClick={fetchAvailablePools}
               className="btn-primary px-12 h-14"
            >
              Restart Discovery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10">
            {availablePools.map((pool) => (
              <div key={pool._id} className="glass-card p-8 sm:p-12 border-accent/10 shadow-xl relative overflow-hidden group hover:border-accent/30 transition-all duration-500 rounded-[2.5rem] sm:rounded-[3.5rem] backdrop-blur-xl">
                <div className="absolute top-0 right-0 p-6 sm:p-10 flex flex-col items-end gap-4">
                   <div className="bg-accent/10 text-accent border border-accent/20 px-4 sm:px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                       <Users className="w-3.5 h-3.5" />
                       {pool.riders.length}/4
                   </div>
                </div>

                <header className="mb-8 sm:mb-12">
                   <p className="text-[9px] font-bold uppercase tracking-widest text-accent mb-2 sm:mb-4 opacity-60">Estimated Yield</p>
                   <div className="flex items-baseline gap-4">
                      <span className="text-5xl sm:text-7xl font-bold text-primary tracking-tighter group-hover:text-accent transition-colors">₹{pool.priceEstimate}</span>
                   </div>
                </header>

                <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12 relative pl-8">
                   <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-accent via-border to-accent/20"></div>
                   
                   <div className="space-y-1 sm:space-y-2 group/loc">
                      <div className="flex items-center gap-4">
                         <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                         <p className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 leading-none">Origin</p>
                      </div>
                      <p className="text-lg sm:text-xl font-semibold truncate text-primary/80 italic pl-7">GRID: {pool.route[0]?.location.coordinates[1].toFixed(4)}, {pool.route[0]?.location.coordinates[0].toFixed(4)}</p>
                   </div>

                   <div className="space-y-1 sm:space-y-2 group/loc">
                      <div className="flex items-center gap-4">
                         <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500"></div>
                         <p className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 leading-none">Hub</p>
                      </div>
                      <p className="text-lg sm:text-xl font-semibold truncate text-primary/80 italic pl-7">GRID: {pool.route[pool.route.length - 1]?.location.coordinates[1].toFixed(4)}, {pool.route[pool.route.length - 1]?.location.coordinates[0].toFixed(4)}</p>
                   </div>
                </div>

                <button 
                  onClick={() => handleAcceptPool(pool._id)}
                  className="btn-primary w-full h-14 sm:h-16 text-xs sm:text-sm gap-4"
                >
                   <span>Engage Operation</span>
                   <Globe className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-40 text-center space-y-8 opacity-20 hover:opacity-100 transition-all duration-700 pb-20">
           <div className="flex items-center justify-center gap-4">
              <Fingerprint className="w-4 h-4 text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Hive Fleet Professional Dashboard</p>
              <Activity className="w-4 h-4 text-accent" />
           </div>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-12 border-t border-border pt-12 max-w-4xl mx-auto">
              <Link to="/driver/dashboard" className="flex items-center gap-3 group opacity-60 hover:opacity-100 transition-opacity">
                 <ArrowLeft className="w-4 h-4 text-accent" />
                 <p className="text-[9px] font-bold tracking-widest uppercase">Dashboard</p>
              </Link>
              <p className="text-[9px] font-bold tracking-widest uppercase opacity-20">Hive Fleet OS • v2.4.0</p>
              <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                 <p className="text-[9px] font-bold tracking-widest uppercase">Protocol Manifest</p>
                 <ChevronRight className="w-4 h-4 text-accent" />
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}
