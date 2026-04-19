import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Calendar, CreditCard, Filter, Star, ArrowRight, ShieldCheck, Activity, Globe } from 'lucide-react';
import { format } from 'date-fns';

const RideHistory: React.FC = () => {
  const { token } = useSelector((s: RootState) => s.auth);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/ride/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRides(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchHistory();
  }, [token]);

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
       </div>
     );
  }

  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-5xl mx-auto px-6 pt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Activity Logs</p>
             </div>
             <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
                Ride <span className="text-accent">History</span>
             </h1>
          </div>
          <button className="h-14 w-14 rounded-xl bg-surface border border-border flex items-center justify-center text-primary hover:bg-background transition-all active:scale-95 shadow-sm">
             <Filter className="w-6 h-6" />
          </button>
        </header>

        {rides.length === 0 ? (
          <div className="glass-card p-20 text-center space-y-6">
             <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mx-auto border border-accent/20">
                <Activity size={40} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">No Activity Recorded</h3>
                <p className="text-secondary text-sm max-w-xs mx-auto">Your journey log is currently empty. Book your first ride to begin tracking your movement across the grid.</p>
             </div>
          </div>
        ) : (
          <div className="space-y-8">
            {rides.map((ride, idx) => (
              <div 
                key={ride._id} 
                className="glass-card p-8 border-accent/10 shadow-xl relative overflow-hidden group hover:border-accent/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-3 text-right">
                  <span className={`text-3xl font-bold tracking-tighter ${ride.status.includes('CANCELLED') ? 'text-muted/30 line-through' : 'text-accent'}`}>
                    ₹{ride.finalPrice || ride.priceEstimate || 0}
                  </span>
                  <div className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                    ride.status.includes('CANCELLED') 
                    ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' 
                    : 'bg-accent/5 text-accent border-accent/10'
                  }`}>
                    {ride.status.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-10">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center border shadow-sm transition-all group-hover:scale-105 ${
                       ride.status.includes('CANCELLED') ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' : 'bg-accent/5 text-accent border-accent/10'
                    }`}>
                       <Calendar className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold tracking-tight text-primary uppercase">{format(new Date(ride.createdAt), 'MMM dd, HH:mm')}</p>
                      <div className="flex items-center gap-4 opacity-40">
                         <p className="text-[10px] font-bold uppercase tracking-widest">{ride.rideType === 'POOL' ? 'Shared Pool' : 'Solo Journey'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {ride.status === 'COMPLETED' && (
                    <div className="flex items-center gap-2 text-accent bg-accent/5 px-4 py-1.5 rounded-xl border border-accent/10">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className={`w-3.5 h-3.5 fill-current`} />
                       ))}
                       <span className="text-xs font-bold ml-1 text-primary">5.0</span>
                    </div>
                  )}
                </div>

                <div className="space-y-8 relative pl-8 py-2 mb-10">
                  <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/40 via-accent/5 to-accent/40"></div>
                  
                  <div className="flex items-start gap-6 group/loc">
                    <div className="mt-1.5 w-3 h-3 rounded-full bg-accent shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 mb-1">Pickup Location</p>
                      <p className="text-base font-semibold text-primary/80 truncate leading-tight uppercase">
                         {ride.pickup?.label || `Point [${ride.pickup?.coordinates?.[0]?.toFixed(4)}, ${ride.pickup?.coordinates?.[1]?.toFixed(4)}]`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group/loc">
                    <div className="mt-1.5 w-3 h-3 rounded-full bg-indigo-400"></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 mb-1">Destination</p>
                      <p className="text-base font-semibold text-primary/80 truncate leading-tight uppercase">
                         {ride.drop?.label || `Point [${ride.drop?.coordinates?.[0]?.toFixed(4)}, ${ride.drop?.coordinates?.[1]?.toFixed(4)}]`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3 text-muted opacity-40">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary font-bold">₹{ride.finalPrice || ride.priceEstimate || 0}</span>
                      </div>
                   </div>
                   <button className="w-full md:w-auto h-12 px-8 rounded-xl bg-surface border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center justify-center gap-3 active:scale-95">
                     Details
                     <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-32 pt-12 border-t border-border opacity-20 flex flex-col items-center gap-4">
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                 <Globe className="w-3.5 h-3.5 text-accent" />
                 <p className="text-[9px] font-bold uppercase tracking-widest">Global Network</p>
              </div>
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                 <p className="text-[9px] font-bold uppercase tracking-widest">Verified Data</p>
              </div>
           </div>
           <p className="text-[9px] font-bold uppercase tracking-widest">Hive OS • Secure Trip Archive</p>
        </footer>
      </div>
    </div>
  );
};

export default RideHistory;
