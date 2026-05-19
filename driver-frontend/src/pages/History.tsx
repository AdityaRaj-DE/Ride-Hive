import { useState, useEffect } from "react";
import api from "../api/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store";
import { 
  History as HistoryIcon, 
  TrendingUp,
  IndianRupee, 
  Calendar, 
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

interface IRide {
  _id: string;
  rideId?: string;
  pickup?: { label?: string; lat?: number; lng?: number };
  drop?: { label?: string; lat?: number; lng?: number };
  price?: number;
  finalPrice?: number;
  priceEstimate?: number;
  status: string;
  createdAt?: string;
  requestedAt?: string;
  isReduced?: boolean;
}

export default function History() {
  const { token } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const [rides, setRides] = useState<IRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/ride/history");
        setRides(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchHistory();
  }, [token]);

  const filteredRides = rides.filter(ride => {
    if (filter === "all") return true;
    return ride.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen text-primary pb-24">
        <div className="max-w-5xl mx-auto px-6 pt-16">
          <div className="h-16 w-64 bg-surface animate-pulse rounded-2xl mb-20"></div>
          <div className="space-y-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card p-10 h-64 animate-pulse border-accent/5">
                <div className="flex justify-between mb-8">
                  <div className="h-6 w-32 bg-surface rounded-lg"></div>
                  <div className="h-8 w-24 bg-surface rounded-lg"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-full bg-surface rounded-lg opacity-50"></div>
                  <div className="h-4 w-3/4 bg-surface rounded-lg opacity-30"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-5xl mx-auto p-mobile-safe relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-10 mb-12 sm:mb-20">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Mission Archives</p>
             </div>
             <h1 className="text-3xl sm:text-6xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
               Ride <span className="text-accent">History</span>
             </h1>
             <p className="text-secondary text-xs sm:text-base font-medium max-w-xl opacity-70">
               Comprehensive log of all traversal operations and grid yields.
             </p>
          </div>

          <div className="flex items-center gap-2 bg-surface/50 p-1.5 rounded-2xl border border-border self-start backdrop-blur-md overflow-x-auto no-scrollbar max-w-full">
             {['all', 'COMPLETED', 'CANCELLED_BY_RIDER'].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                   filter === f ? 'bg-accent text-white shadow-xl' : 'text-muted hover:text-primary hover:bg-surface'
                 }`}
               >
                 {f.replace('CANCELLED_BY_RIDER', 'Cancelled').replace('all', 'All Logs').replace('COMPLETED', 'Success')}
               </button>
             ))}
          </div>
        </header>

        {filteredRides.length === 0 ? (
          <div className="glass-card p-12 sm:p-24 text-center space-y-6 border-accent/10">
             <div className="w-24 h-24 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent mx-auto border border-accent/20 shadow-inner">
                <HistoryIcon size={48} />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl sm:text-3xl font-bold text-primary tracking-tight">Archives Empty</h3>
                <p className="text-secondary text-sm max-w-xs mx-auto opacity-60 font-medium">
                  No operational data found for the current filter parameters.
                </p>
             </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredRides.map((ride, idx) => (
              <div 
                key={ride.rideId || ride._id || idx} 
                className="glass-card p-5 sm:p-8 border-accent/10 hover:border-accent/30 transition-all group overflow-hidden relative backdrop-blur-xl"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.015] group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none">
                   <HistoryIcon size={180} />
                </div>

                <div className="flex flex-col md:flex-row gap-6 sm:gap-10 relative z-10">
                  <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] ${
                            ride.status === 'COMPLETED' 
                            ? 'bg-accent/10 text-accent border border-accent/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}>
                             {ride.status.replace(/_/g, ' ')}
                          </div>
                          <div className="flex items-center gap-2 text-muted opacity-60">
                             <Calendar className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">
                                 {ride.createdAt || ride.requestedAt 
                                   ? format(new Date((ride.createdAt || ride.requestedAt)!), 'MMM dd, yyyy • HH:mm')
                                   : 'Unknown Synchronicity'}
                              </span>
                          </div>
                       </div>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] opacity-30">HEX: {(ride.rideId || ride._id || '').substring(0,12)}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex items-start gap-5 group/item">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(59,130,246,0.4)]"></div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted mb-1 opacity-60">Origin Node</p>
                           <p className="text-base font-bold text-primary/90 truncate leading-tight group-hover/item:text-accent transition-colors">
                              {ride.pickup?.label || `Coordinate [${ride.pickup?.lat?.toFixed(4) || 0}, ${ride.pickup?.lng?.toFixed(4) || 0}]`}
                           </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5 group/item">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted mb-1 opacity-60">Destination Node</p>
                           <p className="text-base font-bold text-primary/90 truncate leading-tight group-hover/item:text-accent transition-colors">
                              {ride.drop?.label || `Coordinate [${ride.drop?.lat?.toFixed(4) || 0}, ${ride.drop?.lng?.toFixed(4) || 0}]`}
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-between items-end md:w-64 pt-8 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-10">
                     <div className="text-right space-y-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted opacity-60">Yield Captured</p>
                        <div className="flex items-center justify-end gap-2 text-2xl sm:text-4xl font-bold text-primary tracking-tighter">
                           <IndianRupee size={18} className="text-accent mt-1" />
                           <span>{ride.status.includes('CANCELLED') ? '0' : (ride.finalPrice || ride.price || ride.priceEstimate || 0)}</span>
                        </div>
                        {ride.isReduced && (
                          <div className="flex items-center justify-end gap-2 text-emerald-500 font-bold bg-emerald-500/5 px-3 py-1 rounded-xl border border-emerald-500/10 w-fit ml-auto">
                             <TrendingUp size={12} />
                             <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Efficiency Bonus</span>
                          </div>
                        )}
                     </div>

                     <button 
                        onClick={() => navigate(`/driver/history/${ride.rideId || ride._id}`)}
                        className="h-12 px-6 rounded-2xl bg-surface border border-border text-[9px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-3 hover:bg-accent hover:text-white hover:border-accent transition-all group-hover:shadow-xl active:scale-95"
                     >
                        DETAILED LOG <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-40 text-center space-y-10 opacity-30 hover:opacity-100 transition-all duration-1000">
           <div className="flex items-center justify-center gap-12">
              <div className="flex items-center gap-3 text-accent">
                 <HistoryIcon className="w-4 h-4" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Operational Archives</p>
              </div>
              <div className="w-[1.5px] h-6 bg-border/50"></div>
              <div className="flex items-center gap-3 text-accent">
                 <TrendingUp className="w-4 h-4" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Lifetime Analysis</p>
              </div>
           </div>
           <p className="text-[9px] font-bold text-muted uppercase tracking-[0.5em]">HIVE MOBILITY • ARCHIVAL STORAGE NODE</p>
        </footer>
      </div>
    </div>
  );
}
