import { useState } from "react";
import {
  emitDriverArriving,
  emitStartRide,
  emitCompleteRide,
  emitUpdatePoolStop,
  emitCancelRide,
} from "../sockets/driverRideSocket";
import { getDriverSocket } from "../sockets/socketClient";
import useRideCall from "../hooks/useRideCall";
import CallModal from "./CallModal";
import { Phone, Navigation, Check, Zap, Target, Activity, Clock, ShieldCheck, MapPin, Wallet, Banknote, QrCode, Users } from 'lucide-react';
import QRCode from "react-qr-code";

export default function ActiveRideCard({ activeRide, onNavigateToPickup, onNavigateToDrop }: { activeRide: any, onNavigateToPickup?: () => void, onNavigateToDrop?: () => void }) {
  const [otp, setOtp] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingPoolStop, setPendingPoolStop] = useState<any>(null);
  
  const socket = getDriverSocket();
  const { startCall, hangup, acceptIncoming, rejectIncoming, toggleMute, state, timer } = useRideCall(socket, activeRide?.rideId || activeRide?._id);

  const handleFinishTrip = (paymentMethod: "CASH" | "WALLET") => {
    setIsProcessing(true);
    
    // Check if we are completing a pool stop or the whole ride
    if (activeRide.rideType === "POOL" && pendingPoolStop) {
       emitUpdatePoolStop(activeRide._id || activeRide.rideId, pendingPoolStop.order, undefined, paymentMethod);
       setIsProcessing(false);
       setShowPaymentModal(false);
       setPendingPoolStop(null);
       return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const currentLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      
      emitCompleteRide(activeRide._id || activeRide.rideId, currentLocation, paymentMethod, (ack) => {
        setIsProcessing(false);
        if (!ack?.error) {
           setShowPaymentModal(false);
        }
      });
    }, (err) => {
      console.error("Location error:", err);
      emitCompleteRide(activeRide._id || activeRide.rideId, { lat: 0, lng: 0 }, paymentMethod, (ack) => {
        setIsProcessing(false);
        if (!ack?.error) {
           setShowPaymentModal(false);
        }
      });
    });
  };

  if (!activeRide) return null;

  return (
    <>
      <div className="glass-card p-6 sm:p-10 border-accent/20 shadow-xl backdrop-blur-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
           <Activity className="w-32 h-32 text-accent" />
        </div>

        <header className="flex items-center justify-between gap-4 mb-8 relative z-10">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Active Journey</p>
              </div>
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Ride ID: {activeRide._id?.substring(0, 8).toUpperCase()}</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-[9px] font-bold text-muted uppercase tracking-widest">Yield Estimate</p>
                 <p className="text-2xl font-bold text-primary">₹{activeRide.price || activeRide.fare || activeRide.priceEstimate || (activeRide.rideType === 'POOL' ? (activeRide.riders?.reduce((acc: number, r: any) => acc + (r.fare || 0), 0)) : 0)}</p>
              </div>

              <button 
                onClick={() => startCall({ callerName: "Passenger" })}
                className="h-12 px-5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-3 active:scale-95 group"
              >
                <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Contact</span>
              </button>

              {(activeRide.status === "DRIVER_ASSIGNED" || activeRide.status === "DRIVER_ARRIVING") && (
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to cancel this trip?")) {
                      emitCancelRide(activeRide._id || activeRide.rideId);
                    }
                  }}
                  className="h-12 px-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 active:scale-95 group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">Cancel</span>
                </button>
              )}
           </div>
        </header>

        <div className="relative z-10 space-y-8">
          {activeRide.rideType === "POOL" ? (
            /* --- POOL RIDE FLOW --- */
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
               {(() => {
                 const currentStop = activeRide.route
                   ?.slice()
                   .sort((a: any, b: any) => a.order - b.order)
                   .find((stop: any) => {
                     const rider = activeRide.riders.find((r: any) => r.riderId === stop.riderId);
                     if (!rider) return false;
                     if (stop.type === "PICKUP") return rider.status === "WAITING";
                     if (stop.type === "DROP") return rider.status === "PICKED";
                     return false;
                   });

                 if (!currentStop) {
                    return (
                      <div className="text-center py-12">
                        <Check className="w-16 h-16 text-success mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-primary">All Stops Completed</h3>
                        <p className="text-secondary text-sm">Waiting for final system synchronization...</p>
                      </div>
                    );
                 }

                 const riderDetails = activeRide.riders?.find((r: any) => r.riderId === currentStop.riderId);

                 return (
                   <div className="space-y-8">
                     <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${currentStop.type === "PICKUP" ? "bg-accent text-white" : "bg-blue-500 text-white"}`}>
                           {currentStop.type === "PICKUP" ? <Zap className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5">Next Operation</p>
                           <h3 className="text-xl font-bold text-primary">
                             {currentStop.type === "PICKUP" ? "Passenger Pickup" : "Passenger Drop"}
                           </h3>
                        </div>
                     </div>

                     <div className="glass-card p-6 border-border/50">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-lg font-bold">
                              {riderDetails?.name?.charAt(0) || "P"}
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Passenger</p>
                              <p className="text-lg font-bold text-primary">{riderDetails?.name || activeRide.riderName || `Passenger ${currentStop.riderId.substring(0,4)}`}</p>
                           </div>
                        </div>

                        {currentStop.type === "PICKUP" ? (
                          <div className="space-y-6">
                             <div className="relative">
                               <input
                                  type="text"
                                  placeholder="OTP"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                  className="w-full text-center text-4xl font-bold tracking-[0.5em] bg-surface text-accent py-6 rounded-xl border border-border outline-none focus:border-accent/50 transition-all shadow-inner"
                                  maxLength={4}
                                />
                             </div>
                             <button
                                onClick={() => {
                                  emitUpdatePoolStop(activeRide._id || activeRide.rideId, currentStop.order, otp);
                                  setOtp("");
                                }}
                                className="btn-primary w-full h-16 text-sm uppercase tracking-widest gap-3"
                              >
                                <Check className="w-5 h-5" /> Confirm Pickup
                              </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                               setPendingPoolStop(currentStop);
                               setShowPaymentModal(true);
                            }}
                            className="w-full h-16 rounded-xl bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            <Check className="w-5 h-5" /> Confirm Dropoff
                          </button>
                        )}
                     </div>

                     <div className="flex gap-4">
                        <button 
                          onClick={() => currentStop.type === "PICKUP" ? onNavigateToPickup?.() : onNavigateToDrop?.()}
                          className="flex-1 h-14 rounded-xl bg-surface border border-border text-primary font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-background transition-all"
                        >
                           <Navigation className="w-4 h-4 text-accent" /> Navigate
                        </button>
                     </div>
                   </div>
                 );
               })()}
            </div>
          ) : (
            /* --- SOLO RIDE FLOW (Original) --- */
            <>
              {/* Solo Passenger Info */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-accent/5 rounded-2xl border border-accent/10 animate-in fade-in slide-in-from-top-4 duration-500">
                 <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-lg font-bold">
                    {activeRide.rider?.name?.charAt(0) || "P"}
                 </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Passenger</p>
                     <p className="text-lg font-bold text-primary truncate">{activeRide.rider?.name || "Passenger"}</p>
                  </div>
                  {activeRide.passengers > 1 && (
                     <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {activeRide.passengers}
                     </div>
                  )}
               </div>

              {activeRide.status === "DRIVER_ASSIGNED" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold tracking-tight text-primary">Heading to Pickup</h3>
                    <p className="text-sm font-medium text-secondary leading-relaxed max-w-md">
                      Follow the navigation terminal to reach the passenger's current location.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                        {onNavigateToPickup && (
                          <button 
                            onClick={onNavigateToPickup} 
                            className="h-14 px-8 rounded-xl bg-surface border border-border text-primary font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-background transition-all active:scale-95 sm:min-w-[160px]"
                          >
                              <Navigation className="w-4 h-4 text-accent" />
                              Navigate
                          </button>
                        )}
                        <button
                          onClick={() => emitDriverArriving(activeRide._id || activeRide.rideId)}
                          className="h-14 flex-1 rounded-xl bg-accent text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <Target className="w-5 h-5" />
                          Confirm Arrival
                        </button>
                  </div>
                </div>
              )}

              {activeRide.status === "DRIVER_ARRIVING" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-2 text-center sm:text-left">
                    <h3 className="text-3xl font-bold tracking-tight text-accent">Arrived at Pickup</h3>
                    <p className="text-sm font-medium text-secondary leading-relaxed max-w-md">
                      Verify the passenger's identity by entering the trip OTP below.
                    </p>
                  </div>
                  
                  <div className="relative max-w-sm mx-auto sm:mx-0">
                    <input
                        type="text"
                        placeholder="ENTER OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full text-center sm:text-left sm:pl-8 text-4xl font-bold tracking-[0.4em] bg-surface text-accent py-8 rounded-2xl border border-border outline-none focus:border-accent/50 transition-all placeholder:text-muted/20 shadow-inner"
                        maxLength={4}
                        autoFocus
                      />
                  </div>

                  <button
                      onClick={() => {
                        const cleanOtp = otp.trim();
                        if (cleanOtp.length === 4) {
                          emitStartRide(activeRide._id || activeRide.rideId, cleanOtp);
                          setOtp("");
                        }
                      }}
                      className="w-full h-16 rounded-xl bg-accent text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Zap className="w-5 h-5" />
                      Start Journey
                    </button>
                </div>
              )}

              {activeRide.status === "IN_PROGRESS" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-accent animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)] w-2/3"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold tracking-tight text-primary">Trip in Progress</h3>
                    <p className="text-sm font-medium text-secondary leading-relaxed max-w-md">
                      Transporting passenger to the designated drop-off destination.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                        {onNavigateToDrop && (
                          <button 
                              onClick={onNavigateToDrop} 
                              className="h-14 px-8 rounded-xl bg-surface border border-border text-primary font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-background transition-all active:scale-95 sm:min-w-[160px]"
                          >
                              <MapPin className="w-4 h-4 text-accent" />
                              Navigate
                          </button>
                        )}
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="h-14 flex-1 rounded-xl bg-accent text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            <Check className="w-5 h-5" />
                            Finish Trip
                          </button>
                   </div>
                   
                   <footer className="pt-6 flex items-center justify-center sm:justify-start gap-8 opacity-40">
                       <div className="flex items-center gap-2">
                         <Clock className="w-3 h-3 text-accent" />
                         <p className="text-[9px] font-bold uppercase tracking-widest">Est: 12 min</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <ShieldCheck className="w-3 h-3 text-accent" />
                         <p className="text-[9px] font-bold uppercase tracking-widest">Secured</p>
                       </div>
                   </footer>
                 </div>
               )}
            </>
          )}
        </div>
      </div>

      {/* Payment Selection Modal (Unified) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="glass-card p-8 max-w-md w-full border-accent/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                 <QrCode className="w-24 h-24 text-accent" />
              </div>

              <div className="text-center mb-8">
                 <h3 className="text-2xl font-bold text-primary mb-2">
                   {activeRide.rideType === "POOL" ? "Collect Pool Payment" : "Finish Journey"}
                 </h3>
                 <p className="text-sm text-secondary font-medium">How did the passenger pay for this segment?</p>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-8">
                 <button
                   onClick={() => handleFinishTrip("WALLET")}
                   disabled={isProcessing}
                   className="h-24 rounded-2xl bg-accent/5 border border-accent/20 flex flex-col items-center justify-center gap-2 hover:bg-accent/10 transition-all group disabled:opacity-50"
                 >
                    <Wallet className={`w-6 h-6 text-accent group-hover:scale-110 transition-transform ${isProcessing ? 'animate-bounce' : ''}`} />
                    <div className="text-center">
                       <p className="text-sm font-bold text-primary">{isProcessing ? "Processing..." : "Digital Wallet / QR"}</p>
                       <p className="text-[10px] text-muted uppercase tracking-widest font-bold">In-App Transaction</p>
                    </div>
                 </button>

                 <button
                   onClick={() => handleFinishTrip("CASH")}
                   disabled={isProcessing}
                   className="h-24 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center gap-2 hover:bg-background transition-all group disabled:opacity-50"
                 >
                    <Banknote className={`w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform ${isProcessing ? 'animate-bounce' : ''}`} />
                    <div className="text-center">
                       <p className="text-sm font-bold text-primary">{isProcessing ? "Processing..." : "Cash Payment"}</p>
                       <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Physical Handover</p>
                    </div>
                 </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center gap-4">
                   <div className="p-3 bg-white rounded-xl">
                      <QRCode 
                        value={`ride_hive_pay_${activeRide._id}_${activeRide.rideType === "POOL" ? (pendingPoolStop?.order || 'p') : 'solo'}`} 
                        size={120}
                        level="L"
                      />
                   </div>
                   <p className="text-[9px] font-bold text-accent uppercase tracking-widest animate-pulse">Show to Passenger</p>
                </div>

                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPendingPoolStop(null);
                  }}
                  className="text-[10px] font-bold text-muted uppercase tracking-widest hover:text-primary transition-colors py-2"
                >
                  Cancel & Return
                </button>
              </div>
           </div>
        </div>
      )}

      <CallModal 
        open={state.incoming || state.ringing || state.inCall || state.connecting}
        state={state}
        timerSec={timer.timerSec}
        onAccept={acceptIncoming}
        onReject={rejectIncoming}
        onHangup={hangup}
        onToggleMute={toggleMute}
        roleLabel="Passenger"
      />
    </>
  );
}
