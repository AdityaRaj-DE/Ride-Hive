import React from 'react';
import { Car, Users, Zap, Shield, Clock, Trophy, ChevronRight, ShieldCheck, Sparkles, Globe, Activity } from 'lucide-react';

const Services: React.FC = () => {
  const primaryServices = [
    { id: 1, title: 'Hive Go', desc: 'Efficient every-day urban transport. Our most popular choice for city commuters.', icon: Car, color: '#6366f1', bg: 'bg-accent/10' },
    { id: 2, title: 'Hive XL', desc: 'Spacious high-capacity SUVs for groups or extra luggage requirements.', icon: Users, color: '#8b5cf6', bg: 'bg-violet-500/10' },
    { id: 3, title: 'Hive Pool', desc: 'Eco-friendly shared rides. Reduce your carbon footprint and trip costs.', icon: Globe, color: '#6366f1', bg: 'bg-accent/10' },
    { id: 4, title: 'Hive LUX', desc: 'The pinnacle of luxury travel. Premium vehicles with our top-rated partners.', icon: Trophy, color: '#8b5cf6', bg: 'bg-violet-500/10' },
  ];

  const features = [
    { title: 'Secure Identity', desc: 'Multi-factor verification and real-time trip monitoring for absolute safety.', icon: ShieldCheck },
    { title: 'Transparent Rates', desc: 'Upfront pricing with no hidden charges. What you see is what you pay.', icon: Sparkles },
    { title: 'Priority Support', desc: 'Dedicated 24/7 assistance team available directly through the application.', icon: Clock },
  ];

  return (
    <div className="min-h-screen text-primary pb-24">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 pt-24 text-center mb-24 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent mb-10 mx-auto backdrop-blur-md">
           <Zap className="w-4 h-4 fill-current" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Premium Mobility Fleet</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-primary leading-tight mb-8">
          Elite <span className="text-accent">Services</span>
        </h1>
        <p className="text-secondary text-base md:text-xl max-w-3xl mx-auto font-medium opacity-60 leading-relaxed">
          Propelling the modern professional with precision, safety, and aesthetic excellence across the urban landscape.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 mb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {primaryServices.map((service, idx) => (
            <div 
              key={service.id} 
              className="glass-card p-10 border-accent/10 shadow-xl relative overflow-hidden group cursor-pointer hover:border-accent/30 transition-all duration-500 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div 
                className={`w-20 h-20 rounded-2xl mb-8 flex items-center justify-center ${service.bg} border border-white/10 shadow-sm group-hover:scale-110 transition-transform`}
                style={{ color: service.color }}
              >
                <service.icon className="w-10 h-10" />
              </div>
              
              <div className="flex-grow space-y-4">
                <h3 className="text-3xl font-bold tracking-tight text-primary leading-none uppercase">{service.title}</h3>
                <p className="text-sm text-secondary font-medium leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                  {service.desc}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-8 border-t border-border mt-10">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-accent transition-colors">Details</span>
                 <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-300">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 mb-32">
        <div className="glass-card p-12 md:p-20 border-accent/10 shadow-2xl relative overflow-hidden rounded-[3rem]">
          <div className="absolute top-0 right-0 p-16 opacity-[0.01] pointer-events-none rotate-12 scale-150">
             <Shield className="w-64 h-64 text-accent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 relative z-10">
            {features.map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 shadow-sm flex items-center justify-center mb-8 text-accent group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold tracking-tight text-primary mb-4 uppercase">{feature.title}</h4>
                <p className="text-sm text-secondary font-medium leading-relaxed opacity-60">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto px-6 mt-32 text-center opacity-20 hover:opacity-100 transition-all duration-700">
         <div className="flex items-center justify-center gap-4 mb-8">
            <Activity className="w-4 h-4 text-accent" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Hive Fleet OS • Secure Service Network</p>
         </div>
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted leading-loose">
           Available in major metro destinations worldwide • London • Dubai • Singapore • Hyderabad • Tokyo • New York
         </p>
      </footer>
    </div>
  );
};

export default Services;
