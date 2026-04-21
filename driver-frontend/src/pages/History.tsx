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

export default function History() {
  const { token } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const [rides, setRides] = useState<any[]>([]);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Terminal Log</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Ride History</h1>
          <p className="text-secondary text-sm font-medium mt-1">Review your past operations and earnings across the grid.</p>
        </div>

        <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-xl border border-border self-start">
           {['all', 'COMPLETED', 'CANCELLED_BY_RIDER'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                 filter === f ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-primary'
               }`}
             >
               {f.replace('CANCELLED_BY_RIDER', 'Cancelled').replace('all', 'All').replace('COMPLETED', 'Done')}
             </button>
           ))}
        </div>
      </header>

      {filteredRides.length === 0 ? (
        <div className="glass-card p-20 text-center space-y-4">
           <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mx-auto border border-accent/20">
              <HistoryIcon size={40} />
           </div>
           <h3 className="text-2xl font-bold text-primary">No Logs Found</h3>
           <p className="text-secondary text-sm max-w-xs mx-auto">You haven't completed any rides yet. Go online and start your first journey!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRides.map((ride, idx) => (
            <div 
              key={ride.rideId || ride._id || idx} 
              className="glass-card p-6 border-accent/10 hover:border-accent/30 transition-all group overflow-hidden relative"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                 <HistoryIcon size={120} />
              </div>

              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                          ride.status === 'COMPLETED' ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}>
                           {ride.status.replace(/_/g, ' ')}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted opacity-60">
                           <Calendar className="w-3 h-3" />
                           <span className="text-[10px] font-bold">
                               {ride.createdAt || ride.requestedAt 
                                 ? format(new Date(ride.createdAt || ride.requestedAt), 'MMM dd, yyyy • HH:mm')
                                 : 'Recently Archived'}
                            </span>
                        </div>
                     </div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-40">ID: {(ride.rideId || ride._id || '').substring(0,8)}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-2 h-2 rounded-full bg-accent"></div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Pickup</p>
                         <p className="text-sm font-semibold text-primary truncate">
                            {ride.pickup?.label || `Point [${ride.pickup?.lat?.toFixed(4) || 0}, ${ride.pickup?.lng?.toFixed(4) || 0}]`}
                         </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Dropoff</p>
                         <p className="text-sm font-semibold text-primary truncate">
                            {ride.drop?.label || `Point [${ride.drop?.lat?.toFixed(4) || 0}, ${ride.drop?.lng?.toFixed(4) || 0}]`}
                         </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col justify-between items-end md:w-56 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-8">
                   <div className="text-right space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Total Earned</p>
                      <div className="flex items-center justify-end gap-1.5 text-3xl font-black text-accent tracking-tighter">
                         <IndianRupee size={22} className="mt-1" />
                         <span>{ride.status.includes('CANCELLED') ? '0' : (ride.finalPrice || ride.price || 0)}</span>
                      </div>
                      {ride.isReduced && (
                        <div className="flex items-center justify-end gap-1.5 text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 w-fit ml-auto">
                           <TrendingUp size={10} />
                           <span className="text-[8px] uppercase tracking-wider">Fare Adjusted</span>
                        </div>
                      )}
                   </div>

                   <button 
                      onClick={() => navigate(`/driver/history/${ride.rideId || ride._id}`)}
                      className="h-10 px-4 rounded-lg bg-surface border border-border text-[9px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:bg-background transition-all group-hover:border-accent/40"
                   >
                      Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
