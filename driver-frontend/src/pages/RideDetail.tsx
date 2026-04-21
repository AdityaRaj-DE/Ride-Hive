import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { 
  ChevronLeft, 
  User, 
  Download, 
  ShieldCheck,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface Ride {
    id: string;
    createdAt: string;
    requestedAt: string;
    status: string;
    distance: number;
    duration: number;
    finalPrice?: number;
    price?: number;
    isReduced?: boolean;
    pickup: { lat: number; lng: number; label: string };
    drop: { lat: number; lng: number; label: string };
    paymentMethod?: string;
    rideType?: string;
    rider?: { name: string; phone?: string };
}

export default function RideDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ride, setRide] = useState<Ride | null>(null);
    const [loading, setLoading] = useState(true);
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchRide = async () => {
            try {
                const res = await api.get(`/ride/${id}`);
                setRide(res.data);
            } catch (err) {
                console.error("Failed to fetch ride details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRide();
    }, [id]);

    const downloadEarningsSummary = async () => {
        if (!receiptRef.current) {
            toast.error("Template not initialized");
            return;
        }
        
        const tId = toast.loading("Generating professional summary...");
        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,
                width: 600,
                windowWidth: 600
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('p', 'pt', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`RideHive_Earnings_${id?.substring(0,8)}.pdf`);
            
            toast.success("Summary downloaded!", { id: tId });
        } catch (err) {
            console.error("PDF generation error:", err);
            toast.error("Failed to generate PDF format.", { id: tId });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-4 text-primary">Ride Not Found</h2>
                <button onClick={() => navigate("/driver/history")} className="btn-primary">Back to History</button>
            </div>
        );
    }

    const isCancelled = ride.status?.includes('CANCELLED');

    return (
        <div className="min-h-screen pb-20 pt-8 animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <button 
                    onClick={() => navigate("/driver/history")}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors mb-8"
                >
                    <ChevronLeft size={16} /> Back to History
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Detail Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card overflow-hidden">
                            <div className="p-8 border-b border-border">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Trip Telemetry</p>
                                        <h2 className="text-3xl font-black tracking-tighter text-primary uppercase">
                                            {ride.createdAt || ride.requestedAt ? format(new Date(ride.createdAt || ride.requestedAt), 'MMMM dd, yyyy') : 'Recently'}
                                        </h2>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        isCancelled ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-success/10 text-success border border-success/20'
                                    }`}>
                                        {ride.status.replace(/_/g, ' ')}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Distance</p>
                                        <p className="text-lg font-bold">{(ride.distance / 1000).toFixed(1)} km</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Duration</p>
                                        <p className="text-lg font-bold">{Math.round(ride.duration / 60)} min</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Earned</p>
                                        <p className="text-lg font-bold text-accent">₹{isCancelled ? '0' : (ride.finalPrice || ride.price || 0)}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Type</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{ride.rideType === 'POOL' ? 'Shared Pool' : 'Solo Ride'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 relative">
                                <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-gradient-to-b from-accent/40 via-accent/5 to-accent/40"></div>
                                
                                <div className="flex items-start gap-6">
                                    <div className="mt-1.5 w-4 h-4 rounded-full bg-accent shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10 flex-shrink-0"></div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted mb-1 opacity-50">Pickup</p>
                                        <p className="text-base font-bold text-primary truncate leading-tight">
                                            {ride.pickup?.label || "Unknown Location"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 flex-shrink-0"></div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted mb-1 opacity-50">Dropoff</p>
                                        <p className="text-base font-bold text-primary truncate leading-tight">
                                            {ride.drop?.label || "Unknown Location"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {ride.rider && (
                            <div className="glass-card p-6 flex items-center gap-6 group">
                                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center border border-accent/20 transition-transform group-hover:scale-105">
                                    <User className="w-8 h-8 text-accent" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted mb-1">Passenger</p>
                                    <h3 className="text-xl font-bold text-primary">{ride.rider.name}</h3>
                                    <p className="text-xs text-secondary font-medium">Contact: {ride.rider.phone || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-2">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-accent mb-0.5">Payment</p>
                                        <p className="text-xs font-black uppercase text-primary">{ride.paymentMethod || 'WALLET'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Actions & Summary */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Actions</h3>
                            <button 
                                onClick={downloadEarningsSummary}
                                className="w-full h-12 rounded-xl bg-accent text-background font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <Download size={14} /> Download Summary
                            </button>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Earnings Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted font-medium">Net Fare</span>
                                    <span className="text-primary font-bold">₹{isCancelled ? '0' : (ride.price || 0)}</span>
                                </div>
                                {ride.isReduced && (
                                    <div className="flex justify-between items-center text-xs text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded">
                                        <span className="font-medium flex items-center gap-1"><TrendingUp size={12}/> Fare Adjusted</span>
                                        <span className="font-bold">Managed</span>
                                    </div>
                                )}
                                <div className="h-px bg-border my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Your Earnings</span>
                                    <span className="text-xl font-black text-accent tracking-tighter">₹{isCancelled ? '0' : (ride.finalPrice || ride.price || 0)}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border opacity-50">
                                    <ShieldCheck className="w-3 h-3 text-success" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest">Verified Payment</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 bg-accent/5 border-accent/10">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity size={18} className="text-accent" />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Node Telemetry</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] uppercase tracking-wider text-muted font-bold">
                                    <span>Sync Hash</span>
                                    <span className="text-primary font-mono">{id?.substring(0,12)}</span>
                                </div>
                                <div className="flex justify-between text-[9px] uppercase tracking-wider text-muted font-bold">
                                    <span>Latency</span>
                                    <span className="text-primary">12ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Receipt for PDF Generation (Clean Style) */}
            <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none">
                <div ref={receiptRef} className="w-[600px] p-12 bg-white text-slate-900 font-sans shadow-none">
                    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">DRIVER EARNINGS</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Payout Summary</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sync node</p>
                            <p className="text-sm font-mono font-bold">#{id?.substring(0,12).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-indigo-600">Period</p>
                            <p className="text-lg font-bold">{ride.createdAt || ride.requestedAt ? format(new Date(ride.createdAt || ride.requestedAt), 'PPP') : 'N/A'}</p>
                            <p className="text-sm text-slate-500">Transaction ID: {id?.substring(0,8)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-emerald-600">Earnings Credited</p>
                            <p className="text-3xl font-black text-slate-900">₹{isCancelled ? '0' : (ride.finalPrice || ride.price || 0)}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-8 mb-12 border border-slate-100">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup Log</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{ride.pickup?.label}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-slate-900 mt-1.5 flex-shrink-0"></div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Drop Log</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{ride.drop?.label}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mb-12 py-8 border-y border-slate-100">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Distance Travelled</p>
                            <p className="text-sm font-bold">{(ride.distance / 1000).toFixed(1)} km</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Elapsed</p>
                            <p className="text-sm font-bold">{Math.round(ride.duration / 60)} mins</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-sm font-black uppercase text-emerald-600">{ride.status}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-2">
                             <ShieldCheck size={14} className="text-emerald-500" />
                             <p className="text-[9px] font-bold uppercase tracking-widest">Node Verified Earnings</p>
                        </div>
                        <p className="text-[9px] font-medium italic">Hive OS Driver Ecosystem</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
