import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { 
  ChevronLeft, 
  User, 
  Car, 
  Download, 
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface Ride {
    rideId: string;
    createdAt: string;
    requestedAt: string;
    status: string;
    distance: number;
    duration: number;
    finalPrice?: number;
    price?: number;
    pickup: { lat: number; lng: number; label: string };
    drop: { lat: number; lng: number; label: string };
    paymentMethod?: string;
    driver?: {
        name: string;
        vehicle?: {
            color: string;
            model: string;
            plateNumber: string;
        };
    };
    rider?: { name: string };
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

    const handleRepeatRide = () => {
        if (!ride) return;
        navigate("/book-ride", { 
            state: { 
                pickup: { 
                    lat: ride.pickup.lat, 
                    lng: ride.pickup.lng, 
                    label: ride.pickup.label 
                }, 
                drop: { 
                    lat: ride.drop.lat, 
                    lng: ride.drop.lng, 
                    label: ride.drop.label 
                } 
            } 
        });
    };

    const downloadReceipt = async () => {
        if (!receiptRef.current) {
            toast.error("Template not initialized");
            return;
        }
        
        const tId = toast.loading("Generating professional receipt...");
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
            pdf.save(`RideHive_Receipt_${id?.substring(0,8)}.pdf`);
            
            toast.success("Receipt downloaded!", { id: tId });
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
                <button onClick={() => navigate("/history")} className="btn-primary">Back to History</button>
            </div>
        );
    }

    const isCancelled = ride.status?.includes('CANCELLED');

    return (
        <div className="min-h-screen pb-20 pt-8 animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <button 
                    onClick={() => navigate("/history")}
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
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Trip Breakdown</p>
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

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Distance</p>
                                        <p className="text-lg font-bold">{(ride.distance / 1000).toFixed(1)} km</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Duration</p>
                                        <p className="text-lg font-bold">{Math.round(ride.duration / 60)} mins</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Cost</p>
                                        <p className="text-lg font-bold text-accent">₹{isCancelled ? '0' : (ride.finalPrice || ride.price || 0)}</p>
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
                                        <p className="text-[10px] text-muted font-medium mt-1">
                                            {ride.pickup?.lat.toFixed(5)}, {ride.pickup?.lng.toFixed(5)}
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
                                        <p className="text-[10px] text-muted font-medium mt-1">
                                            {ride.drop?.lat.toFixed(5)}, {ride.drop?.lng.toFixed(5)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {ride.driver && (
                            <div className="glass-card p-6 flex items-center gap-6 group">
                                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center border border-accent/20 transition-transform group-hover:scale-105">
                                    <User className="w-8 h-8 text-accent" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted mb-1">Your Driver</p>
                                    <h3 className="text-xl font-bold text-primary">{ride.driver.name}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-xs text-secondary font-medium flex items-center gap-1.5">
                                            <Car size={14} className="text-accent" /> {ride.driver.vehicle?.color} {ride.driver.vehicle?.model}
                                        </p>
                                        <div className="w-1 h-1 rounded-full bg-border"></div>
                                        <p className="text-xs text-secondary font-bold uppercase tracking-widest">{ride.driver.vehicle?.plateNumber}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                                        ))}
                                    </div>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-accent">Top Rated</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Actions & Summary */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Actions</h3>
                            <button 
                                onClick={handleRepeatRide}
                                className="w-full h-12 rounded-xl bg-accent text-background font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <RefreshCw size={14} /> Repeat Ride
                            </button>
                            <button 
                                onClick={downloadReceipt}
                                className="w-full h-12 rounded-xl bg-surface border border-border text-primary font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-background transition-colors"
                            >
                                <Download size={14} /> Share Receipt
                            </button>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Payment Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted font-medium">Base Fare</span>
                                    <span className="text-primary font-bold">₹{isCancelled ? '0' : (ride.price || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted font-medium">Platform Fee</span>
                                    <span className="text-emerald-500 font-bold">Included</span>
                                </div>
                                <div className="h-px bg-border my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Total Amount</span>
                                    <span className="text-xl font-black text-accent tracking-tighter">₹{isCancelled ? '0' : (ride.finalPrice || ride.price || 0)}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border opacity-50">
                                    <ShieldCheck className="w-3 h-3 text-success" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest">Transaction Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Receipt for PDF Generation (Clean Style) - Positioned so it's active but invisible */}
            <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none">
                <div ref={receiptRef} className="w-[600px] p-12 bg-white text-slate-900 font-sans shadow-none">
                    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">RIDE-HIVE</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Service Receipt</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Receipt ID</p>
                            <p className="text-sm font-mono font-bold">#{id?.substring(0,12).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-emerald-600">Issued To</p>
                            <p className="text-lg font-bold">{ride.rider?.name || 'Valued Passenger'}</p>
                            <p className="text-sm text-slate-500">Ride Member since 2026</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-indigo-600">Date of Journey</p>
                            <p className="text-lg font-bold">{ride.createdAt || ride.requestedAt ? format(new Date(ride.createdAt || ride.requestedAt), 'PPP') : 'N/A'}</p>
                            <p className="text-sm text-slate-500">{ride.createdAt || ride.requestedAt ? format(new Date(ride.createdAt || ride.requestedAt), 'p') : ''}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-8 mb-12 border border-slate-100">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{ride.pickup?.label}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{ride.drop?.label}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-12">
                        <div className="flex justify-between items-center py-4 border-b border-slate-100">
                            <p className="text-sm font-medium text-slate-600">Trip Fare ({ (ride.distance / 1000).toFixed(1) } km)</p>
                            <p className="text-sm font-bold text-slate-900">₹{isCancelled ? '0' : (ride.price || 0)}</p>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-100">
                            <p className="text-sm font-medium text-slate-600">Platform Services</p>
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest text-[10px]">Included</p>
                        </div>
                        <div className="flex justify-between items-center py-6 bg-slate-900 rounded-xl px-6 text-white mt-8">
                            <p className="text-xs font-black uppercase tracking-[0.2em]">Total Amount Paid</p>
                            <p className="text-2xl font-black tracking-tighter">₹{isCancelled ? '0' : (ride.finalPrice || ride.price || 0)}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-2">
                             <CheckCircle2 size={14} className="text-emerald-500" />
                             <p className="text-[9px] font-bold uppercase tracking-widest">Transaction Authenticated</p>
                        </div>
                        <p className="text-[9px] font-medium italic">Hive-OS Secure Cloud Billing</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
