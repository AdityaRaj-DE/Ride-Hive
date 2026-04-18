import React from 'react';
import { Calendar, CreditCard, Filter, Star, ArrowRight, ShieldCheck, Activity, Globe, MapPin } from 'lucide-react';

const RideHistory: React.FC = () => {
  const rides = [
    { id: 1, pickup: 'Hitech City, Hyderabad', drop: 'Banjara Hills, Hyderabad', date: 'Oct 12, 10:30 AM', cost: '₹245', status: 'Completed', type: 'Premium Sedan', rating: 5, distance: '12.4 km' },
    { id: 2, pickup: 'DLF Cyber City, Gachibowli', drop: 'Airport, Shamshabad', date: 'Oct 10, 04:15 PM', cost: '₹560', status: 'Completed', type: 'Luxury XL', rating: 4, distance: '34.2 km' },
    { id: 3, pickup: 'Inorbit Mall, Madhapur', drop: 'Kukatpally Housing Board', date: 'Oct 08, 08:45 PM', cost: '₹180', status: 'Cancelled', isCancelled: true, type: 'Pool Ride', rating: 0, distance: '8.1 km' },
    { id: 4, pickup: 'Secunderabad Railway Station', drop: 'Uppal Metro Station', date: 'Oct 05, 09:20 AM', cost: '₹320', status: 'Completed', type: 'Mini', rating: 5, distance: '15.7 km' },
  ];

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

        <div className="space-y-8">
          {rides.map((ride, idx) => (
            <div 
              key={ride.id} 
              className="glass-card p-8 border-accent/10 shadow-xl relative overflow-hidden group hover:border-accent/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-3 text-right">
                <span className={`text-3xl font-bold tracking-tighter ${ride.isCancelled ? 'text-muted/30 line-through' : 'text-accent'}`}>{ride.cost}</span>
                <div className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                  ride.isCancelled 
                  ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' 
                  : 'bg-accent/5 text-accent border-accent/10'
                }`}>
                  {ride.status}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-10">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center border shadow-sm transition-all group-hover:scale-105 ${
                    ride.isCancelled ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' : 'bg-accent/5 text-accent border-accent/10'
                  }`}>
                     <Calendar className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold tracking-tight text-primary uppercase">{ride.date}</p>
                    <div className="flex items-center gap-4 opacity-40">
                       <p className="text-[10px] font-bold uppercase tracking-widest">{ride.type}</p>
                    </div>
                  </div>
                </div>
                
                {!ride.isCancelled && (
                  <div className="flex items-center gap-2 text-accent bg-accent/5 px-4 py-1.5 rounded-xl border border-accent/10">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className={`w-3.5 h-3.5 ${i < ride.rating ? 'fill-current' : 'opacity-10'}`} />
                     ))}
                     <span className="text-xs font-bold ml-1 text-primary">{ride.rating}.0</span>
                  </div>
                )}
              </div>

              <div className="space-y-8 relative pl-8 py-2 mb-10">
                <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/40 via-accent/5 to-accent/40"></div>
                
                <div className="flex items-start gap-6 group/loc">
                  <div className="mt-1.5 w-3 h-3 rounded-full bg-accent shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 mb-1">Pickup Location</p>
                    <p className="text-base font-semibold text-primary/80 truncate leading-tight uppercase">{ride.pickup}</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group/loc">
                  <div className="mt-1.5 w-3 h-3 rounded-full bg-indigo-400"></div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 mb-1">Destination</p>
                    <p className="text-base font-semibold text-primary/80 truncate leading-tight uppercase">{ride.drop}</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-muted opacity-40">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Charged to Wallet</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted opacity-40">
                       <Activity className="w-4 h-4" />
                       <span className="text-[9px] font-bold uppercase tracking-widest">{ride.distance} Trip</span>
                    </div>
                 </div>
                 <button className="w-full md:w-auto h-12 px-8 rounded-xl bg-surface border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center justify-center gap-3 active:scale-95">
                   Request Support
                   <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          ))}
        </div>

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
