import React from 'react';
import { Car, Users, Zap, Shield, Clock, Trophy, ChevronRight, ShieldCheck, Sparkles, Globe, Activity } from 'lucide-react';

const Services: React.FC = () => {
  const primaryServices = [
    { id: 1, title: 'Hive Go', desc: 'Efficient every-day urban transport.', icon: Car, color: '#6366f1', bg: 'bg-accent/10' },
    { id: 2, title: 'Hive XL', desc: 'Spacious high-capacity SUVs.', icon: Users, color: '#8b5cf6', bg: 'bg-violet-500/10' },
    { id: 3, title: 'Hive Pool', desc: 'Eco-friendly shared rides.', icon: Globe, color: '#6366f1', bg: 'bg-accent/10' },
    { id: 4, title: 'Hive LUX', desc: 'The pinnacle of luxury travel.', icon: Trophy, color: '#8b5cf6', bg: 'bg-violet-500/10' },
  ];

  const features = [
    { title: 'Secure', desc: 'Multi-factor verification.', icon: ShieldCheck },
    { title: 'Transparent', desc: 'Upfront pricing always.', icon: Sparkles },
    { title: 'Support', desc: 'Dedicated 24/7 assistance.', icon: Clock },
  ];

  return (
    <div className="min-h-screen text-primary pb-24">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 text-center mb-12 sm:mb-24 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-accent/5 border border-accent/10 text-accent mb-6 sm:mb-10 mx-auto backdrop-blur-md">
           <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
           <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Premium Mobility Fleet</span>
        </div>
        <h1 className="text-3xl sm:text-6xl md:text-8xl font-bold tracking-tight text-primary leading-tight mb-4 sm:mb-8">
          Elite <span className="text-accent">Services</span>
        </h1>
        <p className="text-secondary text-sm sm:text-xl max-w-3xl mx-auto font-medium opacity-60 leading-relaxed px-4">
          Propelling the modern professional with precision and safety.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 sm:mb-32 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {primaryServices.map((service, idx) => (
            <div 
              key={service.id} 
              className="glass-card p-5 sm:p-10 border-accent/10 shadow-xl relative overflow-hidden group cursor-pointer hover:border-accent/30 transition-all duration-500 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div 
                className={`w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl mb-4 sm:mb-8 flex items-center justify-center ${service.bg} border border-white/10 shadow-sm group-hover:scale-110 transition-transform`}
                style={{ color: service.color }}
              >
                <service.icon className="w-6 h-6 sm:w-10 sm:h-10" />
              </div>
              
              <div className="flex-grow space-y-2 sm:space-y-4">
                <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-primary leading-none uppercase">{service.title}</h3>
                <p className="text-[10px] sm:text-sm text-secondary font-medium leading-relaxed opacity-60">
                  {service.desc}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 sm:pt-8 border-t border-border mt-4 sm:mt-10">
                 <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-accent transition-colors">Details</span>
                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-border flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-300">
                    <ChevronRight className="w-4 h-4" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mb-16 sm:mb-32">
        <div className="glass-card p-8 sm:p-20 border-accent/10 shadow-2xl relative overflow-hidden rounded-[2rem] sm:rounded-[3rem]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-24 relative z-10">
            {features.map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-accent/10 border border-accent/20 shadow-sm flex items-center justify-center mb-4 sm:mb-8 text-accent group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h4 className="text-lg sm:text-2xl font-bold tracking-tight text-primary mb-2 sm:mb-4 uppercase">{feature.title}</h4>
                <p className="text-xs sm:text-sm text-secondary font-medium leading-relaxed opacity-60">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 sm:mt-32 text-center opacity-20 pb-12">
         <div className="flex items-center justify-center gap-4 mb-4 sm:mb-8">
            <Activity className="w-4 h-4 text-accent" />
            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-muted">Hive Fleet OS • Secure Service Network</p>
         </div>
         <p className="text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-muted leading-loose px-4">
           Available in major metro destinations worldwide
         </p>
      </footer>
    </div>
  );
};

export default Services;
