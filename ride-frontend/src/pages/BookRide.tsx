import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import MapPreview from "../components/MapPreview";
import { emitCreateRide } from "../sockets/rideSocket";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { Navigation, Car, Users, ArrowRight, ShieldCheck, Clock, Loader2, Target, Globe } from 'lucide-react';

type LocationType = {
    lat: number;
    lng: number;
    label?: string;
};

export default function BookRide() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as any;

    const [pickup, setPickup] = useState<LocationType | null>(null);
    const [drop, setDrop] = useState<LocationType | null>(null);
    const [estimate, setEstimate] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<"cab" | "pool">("cab");
    const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);
    const [passengers, setPassengers] = useState(1);

    useEffect(() => {
        if (state?.pickup) {
            setPickup({ ...state.pickup, label: state.pickup.label || "Selected Pickup" });
            setUsingCurrentLocation(false);
        }
        if (state?.drop) {
            setDrop({ ...state.drop, label: state.drop.label || "Selected Drop" });
        }
    }, [state]);

    const ride = useSelector((s: RootState) => s.ride);

    useEffect(() => {
        if (ride.status && !["COMPLETED", "CANCELLED_BY_RIDER", "CANCELLED_BY_DRIVER"].includes(ride.status)) {
            navigate("/ride");
        }
    }, [ride.status, navigate]);

    useEffect(() => {
        if (pickup) return;
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPickup({ lat: latitude, lng: longitude, label: "Current Location" });
                setUsingCurrentLocation(true);
            },
            (err) => console.error(err)
        );
    }, [pickup]);

    useEffect(() => {
        if (!pickup || !drop) return;
        const fetchEstimate = async () => {
            setIsCalculating(true);
            try {
                const res = await api.post("/ride/estimate", {
                    pickup: { lat: pickup.lat, lng: pickup.lng },
                    drop: { lat: drop.lat, lng: drop.lng },
                });
                setEstimate(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsCalculating(false);
            }
        };
        fetchEstimate();
    }, [pickup, drop]);

    const openPickupMap = () => navigate("/map-picker?type=pickup", { state: { pickup, drop } });
    const openDropMap = () => navigate("/map-picker?type=drop", { state: { pickup, drop } });

    const resetCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setPickup({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Current Location" });
            setUsingCurrentLocation(true);
        });
    };

    const bookRide = () => {
        if (!pickup || !drop || !estimate) return;
        if (selectedType === "pool") {
            import("../sockets/rideSocket").then(({ emitCreatePoolRide }) => emitCreatePoolRide({ pickup, drop }));
        } else {
            emitCreateRide({ pickup, drop, passengers });
        }
        navigate("/ride");
    };

    return (
        <div className="h-full flex flex-col lg:block overflow-hidden lg:overflow-visible">
            {/* Map Preview - Fixed Top on Mobile */}
            <div className="h-[35vh] lg:hidden relative">
                 <MapPreview pickup={pickup} drop={drop} />
                 <div className="absolute top-4 left-4 z-20">
                    <div className="bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border text-[8px] font-bold text-accent uppercase tracking-widest">
                        Live Route Map
                    </div>
                 </div>
            </div>

            {/* Control Panel - Scrollable Bottom on Mobile */}
            <div className="flex-1 overflow-y-auto no-scrollbar bottom-sheet -mt-6 lg:mt-0 relative z-20 lg:bg-transparent lg:border-none lg:shadow-none lg:rounded-none lg:p-12 p-6 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8 lg:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-accent">Booking Flow</p>
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
                            Plan your <span className="text-accent">Journey</span>
                        </h1>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        {/* Desktop Side Map */}
                        <div className="lg:col-span-5 space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="glass-card p-6 sm:p-8 space-y-4 lg:space-y-6">
                                <div className="space-y-2 lg:space-y-4">
                                    <label className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-muted block ml-1">Pickup Location</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                            <Navigation className="w-4 h-4 sm:w-5 h-5 text-accent" />
                                        </div>
                                        <button 
                                            onClick={openPickupMap}
                                            className="w-full text-left pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-surface border border-border rounded-xl hover:border-accent/50 transition-all font-semibold text-sm sm:text-base text-primary truncate"
                                        >
                                            {pickup ? pickup.label : "Select pickup point..."}
                                        </button>
                                        {!usingCurrentLocation && (
                                            <button 
                                                onClick={resetCurrentLocation} 
                                                className="mt-2 text-[8px] font-bold text-accent uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity"
                                            >
                                                <Globe className="w-3 h-3" /> Use Current Location
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 lg:space-y-4">
                                    <label className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-muted block ml-1">Drop Location</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                            <Target className="w-4 h-4 sm:w-5 h-5 text-blue-500" />
                                        </div>
                                        <button 
                                            onClick={openDropMap}
                                            className="w-full text-left pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-surface border border-border rounded-xl hover:border-blue-500/50 transition-all font-semibold text-sm sm:text-base text-primary truncate"
                                        >
                                            {drop ? drop.label : "Where to?"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden lg:block h-[300px] rounded-[2rem] overflow-hidden border border-border shadow-lg relative group">
                                 <MapPreview pickup={pickup} drop={drop} />
                            </div>
                        </div>

                        {/* Operational Parameters */}
                        <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-4 duration-700">
                            {isCalculating ? (
                                <div className="glass-card min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center text-center p-8 sm:p-12">
                                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-accent animate-spin mb-4 sm:mb-6" />
                                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">Calculating Estimate</h3>
                                    <p className="text-secondary text-xs sm:text-sm">Finding the most efficient route...</p>
                                </div>
                            ) : estimate ? (
                                <div className="space-y-6 sm:space-y-8 animate-in fade-in scale-in-95 duration-500">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Cab Choice */}
                                        <div 
                                            onClick={() => setSelectedType("cab")}
                                            className={`glass-card p-4 sm:p-6 cursor-pointer transition-all border-2 flex flex-col justify-between min-h-[160px] sm:min-h-[200px] ${selectedType === "cab" ? "border-accent/50 bg-accent/5 ring-1 ring-accent/20" : "border-border hover:bg-surface/50 opacity-60 hover:opacity-100"}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${selectedType === "cab" ? "bg-accent text-background shadow-lg" : "bg-surface text-secondary border border-border"}`}>
                                                    <Car className="w-5 h-5 sm:w-7 sm:h-7" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5 sm:mb-1">Standard</p>
                                                    <span className="text-2xl sm:text-3xl font-bold text-primary">₹{estimate.prices.cab}</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:mt-4">
                                                <h3 className="text-lg sm:text-xl font-bold text-primary">Private</h3>
                                                <p className="text-[10px] text-secondary font-medium truncate">Fast, reliable, and private.</p>
                                            </div>
                                        </div>

                                        {/* Pool Choice */}
                                        <div 
                                            onClick={() => setSelectedType("pool")}
                                            className={`glass-card p-4 sm:p-6 cursor-pointer transition-all border-2 flex flex-col justify-between min-h-[160px] sm:min-h-[200px] ${selectedType === "pool" ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20" : "border-border hover:bg-surface/50 opacity-60 hover:opacity-100"}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${selectedType === "pool" ? "bg-blue-500 text-background shadow-lg" : "bg-surface text-secondary border border-border"}`}>
                                                    <Users className="w-5 h-5 sm:w-7 sm:h-7" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5 sm:mb-1">Economy</p>
                                                    <span className="text-2xl sm:text-3xl font-bold text-primary">₹{estimate.prices.pool}</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:mt-4">
                                                <h3 className="text-lg sm:text-xl font-bold text-primary">Shared</h3>
                                                <p className="text-[10px] text-secondary font-medium truncate">Save money and emissions.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedType === "cab" && (
                                        <div className="glass-card p-4 sm:p-6 border-accent/20 animate-in fade-in zoom-in duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-accent">Passengers</p>
                                                    <h3 className="text-base sm:text-lg font-bold text-primary">Select Count</h3>
                                                </div>
                                                <div className="flex items-center gap-4 sm:gap-6">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setPassengers(Math.max(1, passengers - 1)); }}
                                                        disabled={passengers <= 1}
                                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary hover:border-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        <span className="text-xl">-</span>
                                                    </button>
                                                    <span className="text-xl sm:text-3xl font-bold text-primary min-w-[1.2rem] text-center">{passengers}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setPassengers(Math.min(6, passengers + 1)); }}
                                                        disabled={passengers >= 6}
                                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                                                    >
                                                        <span className="text-xl">+</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="glass-card p-6 sm:p-8 border-accent/10">
                                         <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                                            <div className="space-y-1">
                                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                                                    <Navigation className="w-3 h-3" /> Distance
                                                </p>
                                                <p className="text-xl sm:text-3xl font-bold text-primary">{(estimate.distance / 1000).toFixed(1)} km</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Time
                                                </p>
                                                <p className="text-xl sm:text-3xl font-bold text-primary">{(estimate.duration / 60).toFixed(0)} min</p>
                                            </div>
                                         </div>

                                         <button 
                                            onClick={bookRide}
                                            className="btn-primary w-full h-14 sm:h-16 text-base sm:text-lg gap-4"
                                         >
                                            Confirm {selectedType === "cab" ? "Ride" : "Pool"}
                                            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                         </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card min-h-[200px] sm:min-h-[400px] flex flex-col items-center justify-center text-center p-8 sm:p-12 group transition-all">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-surface flex items-center justify-center border border-border mb-4 sm:mb-8 group-hover:scale-105 transition-transform">
                                        <Car className="w-12 h-12 sm:w-16 sm:h-16 text-muted opacity-20" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-4 tracking-tight">Ready to roll?</h2>
                                    <p className="text-secondary text-xs sm:text-sm max-w-xs mx-auto font-medium opacity-60">
                                        Enter your destination to see prices.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <footer className="mt-12 sm:mt-32 pt-8 sm:pt-12 border-t border-border flex flex-col items-center gap-4 opacity-30 pb-12">
                       <div className="flex items-center gap-8">
                          <div className="flex items-center gap-2">
                             <Globe className="w-3 h-3 text-accent" />
                             <p className="text-[8px] font-bold uppercase tracking-widest text-center">Ride-Hive Global v2.0</p>
                          </div>
                       </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}