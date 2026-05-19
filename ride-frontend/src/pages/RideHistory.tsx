import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Calendar, CreditCard, Filter, Star, ArrowRight, ShieldCheck, Activity, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface Ride {
  _id: string;
  rideId?: string;
  status: string;
  finalPrice?: number;
  price?: number;
  isReduced?: boolean;
  createdAt?: string;
  requestedAt?: string;
  rideType?: string;
  pickup?: { label?: string; lat?: number; lng?: number };
  drop?: { label?: string; lat?: number; lng?: number };
}

const RideHistory: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useSelector((s: RootState) => s.auth);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen text-primary pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16">
          <div className="h-12 w-48 sm:h-16 sm:w-64 bg-surface animate-pulse rounded-2xl mb-12 sm:mb-20"></div>
          <div className="space-y-6 sm:space-y-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card p-6 sm:p-10 h-48 sm:h-64 animate-pulse border-accent/5">
                <div className="flex justify-between mb-4 sm:mb-8">
                  <div className="h-6 w-24 sm:w-32 bg-surface rounded-lg"></div>
                  <div className="h-6 w-16 sm:w-24 bg-surface rounded-lg"></div>
                </div>
                <div className="space-y-3 sm:space-y-4">
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-16">
          <div className="space-y-2 sm:space-y-4">
             <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-accent">Activity Logs</p>
             </div>
             <h1 className="text-2xl sm:text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
                Ride <span className="text-accent">History</span>
             </h1>
          </div>
          <button className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-surface border border-border flex items-center justify-center text-primary hover:bg-background transition-all active:scale-95 shadow-sm">
             <Filter className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </header>

        {rides.length === 0 ? (
          <div className="glass-card p-12 sm:p-20 text-center space-y-4 sm:space-y-6">
             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mx-auto border border-accent/20">
                <Activity className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-primary">No Activity</h3>
                <p className="text-secondary text-xs sm:text-sm max-w-xs mx-auto opacity-60">Your journey log is currently empty.</p>
             </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-8">
            {rides.map((ride, idx) => (
              <div 
                key={ride._id} 
                className="glass-card p-4 sm:p-8 border-accent/10 shadow-xl relative overflow-hidden group hover:border-accent/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="sm:absolute top-0 right-0 p-0 sm:p-8 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-3 text-right mb-4 sm:mb-0">
                  <div className={`px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border ${
                    ride.status.includes('CANCELLED') 
                    ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' 
                    : 'bg-accent/5 text-accent border-accent/10'
                  } order-2 sm:order-1`}>
                    {ride.status.replace(/_/g, ' ')}
                  </div>
                  <div className="flex flex-col items-start sm:items-end order-1 sm:order-2">
                    <span className={`text-xl sm:text-3xl font-bold tracking-tighter ${ride.status.includes('CANCELLED') ? 'text-muted/30 line-through' : 'text-accent'}`}>
                      ₹{ride.finalPrice || ride.price || 0}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row gap-4 sm:gap-8 items-center mb-4 sm:mb-10">
                  <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border shadow-sm transition-all group-hover:scale-105 ${
                     ride.status.includes('CANCELLED') ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' : 'bg-accent/5 text-accent border-accent/10'
                  }`}>
                     <Calendar className="w-5 h-5 sm:w-8 sm:h-8" />
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-sm sm:text-2xl font-bold tracking-tight text-primary uppercase leading-tight">
                       {ride.createdAt || ride.requestedAt 
                         ? !isNaN(new Date(ride.createdAt || ride.requestedAt || '').getTime()) 
                           ? format(new Date(ride.createdAt || ride.requestedAt || ''), 'MMM dd, HH:mm')
                           : 'Recent Trip'
                         : 'Recent Trip'}
                    </p>
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-40">{ride.rideType === 'POOL' ? 'Shared Pool' : 'Solo Journey'}</p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 relative pl-6 sm:pl-8 py-1 sm:py-2 mb-6 sm:mb-10">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/40 via-accent/5 to-accent/40 sm:left-2.5"></div>
                  
                  <div className="flex items-start gap-3 sm:gap-6 group/loc">
                    <div className="mt-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-accent shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 mb-0.5">Pickup</p>
                      <p className="text-xs sm:text-base font-semibold text-primary/80 truncate leading-tight uppercase">
                          {ride.pickup?.label || `Point [${ride.pickup?.lat?.toFixed(4) || 0}, ${ride.pickup?.lng?.toFixed(4) || 0}]`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-6 group/loc">
                    <div className="mt-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-indigo-400"></div>
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 mb-0.5">Destination</p>
                      <p className="text-xs sm:text-base font-semibold text-primary/80 truncate leading-tight uppercase">
                         {ride.drop?.label || `Point [${ride.drop?.lat?.toFixed(4) || 0}, ${ride.drop?.lng?.toFixed(4) || 0}]`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
                   <div className="flex items-center gap-6 sm:gap-8">
                      <div className="flex items-center gap-2 sm:gap-3 text-muted opacity-40">
                        <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">₹{ride.status.includes('CANCELLED') ? '0' : (ride.finalPrice || ride.price || 0)}</span>
                      </div>
                      {ride.status === 'COMPLETED' && (
                        <div className="flex items-center gap-2 text-accent">
                           <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                           <span className="text-[10px] sm:text-xs font-bold text-primary">5.0</span>
                        </div>
                      )}
                   </div>
                   <button 
                      onClick={() => navigate(`/history/${ride.rideId || ride._id}`)}
                      className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8 rounded-xl bg-surface border border-border text-[8px] sm:text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95"
                   >
                     Details
                     <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-16 sm:mt-32 pt-8 sm:pt-12 border-t border-border opacity-20 flex flex-col items-center gap-4 pb-12">
           <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-center px-4">Hive OS • Secure Trip Archive</p>
        </footer>
      </div>
    </div>
  );
};

export default RideHistory;
