import React, { useState } from 'react';
import { Settings, Shield, Zap, Car, MapPin, Globe, ChevronRight, Target, Crown, Activity, Sparkles, ShieldCheck, Fingerprint, ArrowRight } from 'lucide-react';

const Services: React.FC = () => {
  const [preferences, setPreferences] = useState({
    autoAccept: true,
    poolRides: true,
    longRides: false,
    highRatedOnly: true,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: 'Service Preferences',
      subtitle: 'Customize your ride intake to match your driving style.',
      items: [
        { id: 'autoAccept', label: 'Auto-Accept Rides', icon: Zap, value: preferences.autoAccept },
        { id: 'poolRides', label: 'Accept Pooling', icon: Globe, value: preferences.poolRides },
        { id: 'longRides', label: 'Long Distance', icon: MapPin, value: preferences.longRides },
        { id: 'highRatedOnly', label: 'Elite Riders only', icon: Shield, value: preferences.highRatedOnly },
      ]
    },
    {
      title: 'Vehicle Information',
      subtitle: 'Details of your registered transport unit.',
      items: [
        { label: 'Registered Vehicle', icon: Car, value: 'Tesla Model S • TS 09 AB 1234' },
        { label: 'Network Hub', icon: Settings, value: 'Sector 4 Peripheral' },
      ]
    }
  ];

  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-7xl mx-auto p-mobile-safe relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-20 space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Interface Parameters</p>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
            Pilot <span className="text-accent underline decoration-4 underline-offset-14">Settings</span>
          </h1>
          <p className="text-secondary text-base md:text-xl font-medium max-w-4xl mx-auto md:mx-0 opacity-60 leading-relaxed uppercase tracking-tight">
            Adjust your professional filters and manage your unit telemetry for optimal regional performance.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          <div className="xl:col-span-8 space-y-16">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-8">
                 <div className="px-1 sm:px-4">
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-primary uppercase mb-2">
                      {section.title}
                    </h2>
                    <p className="text-[10px] sm:text-sm text-secondary font-medium opacity-40 uppercase tracking-widest">{section.subtitle}</p>
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {section.items.map((item, iIdx) => (
                     <div key={iIdx} className="glass-card p-6 sm:p-10 border-accent/5 shadow-lg relative overflow-hidden group hover:border-accent/20 transition-all backdrop-blur-xl">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none group-hover:scale-110 transition-transform -rotate-12 translate-x-4">
                         <item.icon className="w-32 h-32 text-accent" />
                      </div>

                      <div className="flex items-center gap-6 relative z-10">
                         <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10 shadow-sm group-hover:bg-accent group-hover:text-white transition-all">
                          <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                         <div className="flex-1 min-w-0">
                             <p className="text-lg sm:text-xl font-bold tracking-tight uppercase leading-none mb-1">{item.label}</p>
                             {typeof item.value === 'string' && <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 italic">{item.value}</p>}
                         </div>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between relative z-10">
                        {typeof item.value === 'boolean' ? (
                          <>
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${item.value ? 'bg-accent animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-border'}`}></div>
                               <p className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-40">{item.value ? 'ACTIVE' : 'DISABLED'}</p>
                            </div>
                            <button 
                              onClick={() => togglePreference(item.id as keyof typeof preferences)}
                              className={`w-14 h-7 rounded-full transition-all relative p-1 shadow-inner ${item.value ? 'bg-accent' : 'bg-surface border border-border'}`}
                            >
                              <div className={`w-5 h-5 rounded-md bg-white transition-all shadow-sm ${item.value ? 'ml-7' : 'ml-0'}`}>
                              </div>
                            </button>
                          </>
                        ) : (
                          <button className="w-full h-12 rounded-xl bg-surface border border-border flex items-center justify-between px-6 group/item hover:border-accent/40 transition-all active:scale-95">
                             <span className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 group-hover/item:opacity-80 transition-opacity">Asset Logs</span>
                             <ChevronRight className="w-4 h-4 text-accent" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="xl:col-span-4 space-y-12">
            {/* Incentive Hub */}
             <div className="glass-card p-6 sm:p-10 border-accent/10 shadow-xl relative overflow-hidden group backdrop-blur-xl">
               <div className="absolute top-0 right-0 p-10 opacity-[0.01] pointer-events-none rotate-12 translate-x-4">
                  <Crown className="w-48 h-48 text-accent" />
               </div>

               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                        <Sparkles className="w-6 h-6 fill-current animate-pulse" />
                     </div>
                     <h3 className="text-2xl font-bold uppercase tracking-tight text-primary">Incentives</h3>
                  </div>
                  
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-accent opacity-60">Daily Trajectory Reward</p>
                     <p className="text-sm text-secondary font-medium opacity-40 leading-relaxed uppercase tracking-tight">
                        Log 150 more kilometers today to unlock your ₹500 regional dividend.
                     </p>
                  </div>

                  <div className="space-y-4 pt-4">
                     <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted opacity-40 px-1">
                        <span>Current Progression</span>
                        <span className="text-accent">71%</span>
                     </div>
                     <div className="h-4 w-full bg-surface rounded-full border border-border p-1 relative overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          style={{ width: '71%' }}
                        />
                     </div>
                  </div>

                  <button className="btn-primary w-full h-14 text-[10px] tracking-widest gap-3">
                     <span>View All Rewards</span>
                     <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <div className="glass-card p-8 border-border rounded-3xl opacity-30 hover:opacity-100 transition-all duration-500 cursor-default">
               <h4 className="text-[9px] font-bold uppercase tracking-widest text-accent mb-6 opacity-60">Grid Network Health</h4>
               <div className="space-y-4">
                  {[
                     { label: 'Regional HUB', val: 'Connected', color: 'text-accent' },
                     { label: 'SSL Protocol', val: 'Verified', color: 'text-accent' },
                     { label: 'Node Status', val: 'Optimal', color: 'text-accent' }
                  ].map((h, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                       <p className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-40">{h.label}</p>
                       <p className={`text-[10px] font-bold uppercase tracking-widest ${h.color}`}>{h.val}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <footer className="mt-32 text-center space-y-8 opacity-20 hover:opacity-100 transition-all duration-700 pb-20">
           <div className="flex items-center justify-center gap-4">
              <Fingerprint className="w-4 h-4 text-accent" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Astra Operational Link v2.4.0</p>
              <Activity className="w-4 h-4 text-accent" />
           </div>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-12 border-t border-border pt-12 max-w-4xl mx-auto italic">
              <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                 <p className="text-[9px] font-bold tracking-widest uppercase">Grid Protocol</p>
                 <ChevronRight className="w-4 h-4 text-accent" />
              </div>
              <p className="text-[9px] font-bold tracking-widest uppercase opacity-20">Hive Professional Emerald Edition</p>
              <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                 <p className="text-[9px] font-bold tracking-widest uppercase">Privacy Manifest</p>
                 <ChevronRight className="w-4 h-4 text-accent" />
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default Services;
