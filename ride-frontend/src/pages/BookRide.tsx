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

    useEffect(() => {
        if (state?.pickup) {
            setPickup({ ...state.pickup, label: "Selected Pickup" });
            setUsingCurrentLocation(false);
        }
        if (state?.drop) {
            setDrop({ ...state.drop, label: "Selected Drop" });
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
            emitCreateRide({ pickup, drop });
        }
        navigate("/ride");
    };

    return (
        <div className="min-h-screen pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
                <header className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Booking Flow</p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                        Plan your <span className="text-accent">Journey</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Control Panel */}
                    <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="glass-card p-6 sm:p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted block ml-1">Pickup Location</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <Navigation className="w-5 h-5 text-accent" />
                                    </div>
                                    <button 
                                        onClick={openPickupMap}
                                        className="w-full text-left pl-12 pr-10 py-4 bg-surface border border-border rounded-xl hover:border-accent/50 transition-all font-semibold text-primary truncate"
                                    >
                                        {pickup ? pickup.label : "Select pickup point..."}
                                    </button>
                                    {!usingCurrentLocation && (
                                        <button 
                                            onClick={resetCurrentLocation} 
                                            className="mt-2 text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity"
                                        >
                                            <Globe className="w-3 h-3" /> Use Current Location
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted block ml-1">Drop Location</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <Target className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <button 
                                        onClick={openDropMap}
                                        className="w-full text-left pl-12 pr-10 py-4 bg-surface border border-border rounded-xl hover:border-blue-500/50 transition-all font-semibold text-primary truncate"
                                    >
                                        {drop ? drop.label : "Where to?"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block h-[300px] rounded-[2rem] overflow-hidden border border-border shadow-lg relative group">
                             <MapPreview pickup={pickup} drop={drop} />
                             <div className="absolute top-4 left-4 z-20">
                                <div className="bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold text-accent uppercase tracking-widest">
                                    Live Map Preview
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Operational Parameters */}
                    <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-4 duration-700">
                        {isCalculating ? (
                            <div className="glass-card min-h-[400px] flex flex-col items-center justify-center text-center p-12">
                                <Loader2 className="w-12 h-12 text-accent animate-spin mb-6" />
                                <h3 className="text-xl font-bold text-primary mb-2">Calculating Estimate</h3>
                                <p className="text-secondary text-sm">Finding the most efficient route for you...</p>
                            </div>
                        ) : estimate ? (
                            <div className="space-y-8 animate-in fade-in scale-in-95 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Cab Choice */}
                                    <div 
                                        onClick={() => setSelectedType("cab")}
                                        className={`glass-card p-6 cursor-pointer transition-all border-2 flex flex-col justify-between min-h-[200px] ${selectedType === "cab" ? "border-accent/50 bg-accent/5 ring-1 ring-accent/20" : "border-border hover:bg-surface/50 opacity-60 hover:opacity-100"}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selectedType === "cab" ? "bg-accent text-background shadow-lg" : "bg-surface text-secondary border border-border"}`}>
                                                <Car className="w-7 h-7" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Standard</p>
                                                <span className="text-3xl font-bold text-primary">₹{estimate.prices.cab}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-xl font-bold text-primary">Private Voyage</h3>
                                            <p className="text-xs text-secondary font-medium">Fast, reliable, and just for you.</p>
                                        </div>
                                    </div>

                                    {/* Pool Choice */}
                                    <div 
                                        onClick={() => setSelectedType("pool")}
                                        className={`glass-card p-6 cursor-pointer transition-all border-2 flex flex-col justify-between min-h-[200px] ${selectedType === "pool" ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20" : "border-border hover:bg-surface/50 opacity-60 hover:opacity-100"}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selectedType === "pool" ? "bg-blue-500 text-background shadow-lg" : "bg-surface text-secondary border border-border"}`}>
                                                <Users className="w-7 h-7" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">Economy</p>
                                                <span className="text-3xl font-bold text-primary">₹{estimate.prices.pool}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-xl font-bold text-primary">Shared Pool</h3>
                                            <p className="text-xs text-secondary font-medium">Save money and reduce emissions.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-8 border-accent/10">
                                     <div className="grid grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                                                <Navigation className="w-3 h-3" /> Distance
                                            </p>
                                            <p className="text-3xl font-bold text-primary">{(estimate.distance / 1000).toFixed(1)} km</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Estimated Time
                                            </p>
                                            <p className="text-3xl font-bold text-primary">{(estimate.duration / 60).toFixed(0)} min</p>
                                        </div>
                                     </div>

                                     <button 
                                        onClick={bookRide}
                                        className="btn-primary w-full h-16 text-lg gap-4"
                                     >
                                        Confirm {selectedType === "cab" ? "Ride" : "Pool"}
                                        <ArrowRight className="w-6 h-6" />
                                     </button>

                                     <div className="mt-6 flex items-center justify-center gap-6 opacity-50">
                                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                            <ShieldCheck className="w-3 h-3 text-success" /> Guaranteed Safety
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-border"></div>
                                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                            <Globe className="w-3 h-3 text-accent" /> Eco Friendly
                                        </div>
                                     </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card min-h-[400px] flex flex-col items-center justify-center text-center p-12 group transition-all">
                                <div className="w-32 h-32 rounded-2xl bg-surface flex items-center justify-center border border-border mb-8 group-hover:scale-105 transition-transform">
                                    <Car className="w-16 h-16 text-muted opacity-20" />
                                </div>
                                <h2 className="text-2xl font-bold text-primary mb-4 tracking-tight">Ready to roll?</h2>
                                <p className="text-secondary text-sm max-w-sm mx-auto font-medium">
                                    Enter your destination to see prices and book a ride with our premium fleet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <footer className="mt-32 pt-12 border-t border-border flex flex-col items-center gap-4 opacity-40">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                     <Globe className="w-3 h-3 text-accent" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">Ride-Hive Global v2.0</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <ShieldCheck className="w-3 h-3 text-accent" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">Secure Handshake Level 7</p>
                  </div>
               </div>
            </footer>
        </div>
    );
}