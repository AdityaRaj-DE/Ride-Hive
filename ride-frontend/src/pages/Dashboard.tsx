import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { MapPin, Clock, Star, Shield, Car, Zap, ArrowRight, User, Sparkles, Navigation, Globe, Activity } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
             <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Personal Dashboard</p>
             </div>
             <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight text-primary leading-tight">
               Welcome back, <br />
               <span className="text-accent">{(user as any)?.name?.split(' ')[0] || 'Rider'}</span>
             </h1>
             <p className="text-secondary text-lg font-medium max-w-xl">
               Where would you like to go today? Your premium ride is just a tap away.
             </p>
          </div>
          
          <div className="glass-card flex items-center gap-4 px-6 py-4 border-accent/10 active:scale-[0.98] transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
               <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Rider Tier</p>
               <p className="font-bold text-xl text-primary">Elite 4.92</p>
            </div>
          </div>
        </header>

        {/* Main Action Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          <div 
            onClick={() => navigate("/book-ride")}
            className="lg:col-span-8 relative min-h-[350px] sm:min-h-[480px] rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-accent to-blue-700 p-6 sm:p-12 text-white overflow-hidden group cursor-pointer shadow-xl animate-in fade-in slide-in-from-left-4 duration-700 transition-all hover:shadow-accent/20"
          >
             <div className="relative z-20 h-full flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                     <Navigation className="w-4 h-4" />
                     Instant Booking
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                     Request a ride <br />
                     <span className="text-white/60 group-hover:text-white transition-colors duration-500">to any destination.</span>
                  </h2>
                  <div className="flex items-center gap-4 bg-white text-accent px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg w-fit">
                     <MapPin className="w-5 h-5" />
                     Start Journey
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-white/70 font-bold uppercase text-xs tracking-widest group-hover:text-white transition-all duration-300">
                   Explore your city
                   <ArrowRight className="w-6 h-6 animate-pulse" />
                </div>
             </div>
             
             {/* Decorative Elements */}
             <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
             <Car className="absolute bottom-[-5%] right-[-10%] w-[400px] h-[400px] text-white/5 -rotate-12 group-hover:rotate-0 transition-all duration-1000 pointer-events-none" />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
             <QuickActionCard 
                title="History" 
                desc="Past Journeys" 
                icon={Clock} 
                onClick={() => navigate("/history")} 
                color="accent"
             />
             <QuickActionCard 
                title="Safety" 
                desc="Security Center" 
                icon={Shield} 
                onClick={() => {}} 
                color="success"
             />
             <QuickActionCard 
                title="Profile" 
                desc="Account Settings" 
                icon={User} 
                onClick={() => navigate("/profile")} 
                color="accent"
             />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <TrustItem 
            icon={Shield} 
            title="Secure Travels" 
            desc="Every trip is monitored and protected by our advanced security protocols." 
            color="text-accent" 
          />
          <TrustItem 
            icon={Zap} 
            title="Fast Pickup" 
            desc="Our algorithms ensure a driver reaches your location in record time." 
            color="text-success" 
          />
          <TrustItem 
            icon={Sparkles} 
            title="Premium Fleet" 
            desc="Only top-rated vehicles and drivers are allowed on our platform." 
            color="text-accent" 
          />
        </div>

        {/* Footer info */}
        <div className="text-center py-12 border-t border-border opacity-50">
           <div className="flex items-center justify-center gap-4 mb-2">
              <Globe className="w-4 h-4 text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Ride-Hive Global Network v2.0</p>
              <Activity className="w-4 h-4 text-accent" />
           </div>
           <p className="text-[8px] font-semibold uppercase tracking-widest">Secured by End-to-End Encryption</p>
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color: 'accent' | 'success';
}

function QuickActionCard({ title, desc, icon: Icon, onClick, color }: QuickActionCardProps) {
  const colorStyles = color === 'accent' 
    ? 'text-accent border-accent/10 hover:bg-accent/5' 
    : 'text-success border-success/10 hover:bg-success/5';

  return (
    <div 
      onClick={onClick}
      className={`glass-card p-8 flex flex-col justify-between min-h-[140px] cursor-pointer group active:scale-[0.98] transition-all relative overflow-hidden h-full ${colorStyles}`}
    >
      <div className="flex justify-between items-start">
         <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-7 h-7" />
         </div>
         <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
      </div>
      <div>
        <h4 className="font-bold text-xl text-primary tracking-tight">{title}</h4>
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">{desc}</p>
      </div>
    </div>
  );
}

function TrustItem({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="glass-card p-8 group hover:bg-surface/50 transition-all duration-500 border-accent/5">
       <div className={`w-14 h-14 rounded-xl bg-surface flex items-center justify-center ${color} mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-7 h-7" />
       </div>
       <div className="space-y-2">
          <p className="font-bold text-xl text-primary tracking-tight">{title}</p>
          <p className="text-sm text-secondary font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}