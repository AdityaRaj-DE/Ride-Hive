// components/driver/SubscriptionCard.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { subscribePlan } from "../../store/slices/driverWalletSlice";
import { ShieldCheck, Zap, Activity, Cpu, Sparkles, AlertCircle, Clock } from 'lucide-react';

export default function SubscriptionCard() {
  const dispatch = useDispatch<AppDispatch>();
  const { subscription } = useSelector(
    (state: RootState) => state.driverWallet
  );
  const isActive = subscription?.isActive;

  const plans = [
    { name: "Monthly", price: 500, durationDays: 30 },
  ];

  const handleSubscribe = (planName: string) => {
    if (isActive) return;
    dispatch(subscribePlan(planName));
  };

  return (
    <div className="premium-card p-10 glass-panel border border-white/10 shadow-[0_64px_128px_rgba(0,0,0,0.8)] backdrop-blur-3xl rounded-[3.5rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-1000">
      {/* Background HUD Pulse */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000 rotate-12">
         <ShieldCheck className="w-48 h-48 text-emerald-500" />
      </div>

      <header className="flex items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-5 group/title">
           <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover/title:rotate-12 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Zap className="w-7 h-7 shadow-[0_0_15px_rgba(16,185,129,1)]" />
           </div>
           <h2 className="text-2xl font-black italic tracking-tighter uppercase text-main leading-none">Manifest <span className="text-emerald-500">Access</span></h2>
        </div>
        
        {isActive ? (
          <div className="px-5 py-2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-3xl italic flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
             Node Active
          </div>
        ) : (
          <div className="px-5 py-2 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_0_20px_rgba(244,63,94,0.1)] backdrop-blur-3xl italic flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,1)]"></div>
             Lattice Locked
          </div>
        )}
      </header>

      <div className="space-y-10 relative z-10">
        {isActive && subscription?.plan && (
          <div className="flex flex-col gap-4 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-inner italic">
            <div className="flex items-center gap-4 text-emerald-500">
               <Activity className="w-5 h-5 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <p className="text-sm font-black uppercase tracking-tighter">
                 Active Protocol: <span className="text-main">{subscription.plan.name}</span>
               </p>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground opacity-40">
               <Clock className="w-4 h-4" />
               <p className="text-[11px] font-black uppercase tracking-[0.2em] italic">
                 Handshake Expiry: <span className="font-mono">{new Date(subscription.expiresAt).toLocaleDateString()}</span>
               </p>
            </div>
            <div className="flex items-center gap-3 text-emerald-500/40 text-[9px] font-black uppercase tracking-[0.5em] mt-2">
               <Sparkles className="w-3.5 h-3.5" />
               Auto-renewal L7 Sync Enabled
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {plans.map((plan) => (
            <button
              key={plan.name}
              disabled={isActive}
              onClick={() => handleSubscribe(plan.name)}
              className={`group/plan relative p-10 rounded-[2.5rem] text-left border transition-all duration-700 overflow-hidden ${
                isActive
                  ? "bg-white/[0.01] border-white/5 opacity-40 grayscale"
                  : "bg-white/[0.03] border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:scale-[1.02] shadow-2xl"
              }`}
            >
              {/* Background Glow for Hover */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover/plan:opacity-100 transition-opacity duration-1000"></div>
              )}
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="space-y-3">
                    <p className="text-xl font-black italic tracking-tighter uppercase group-hover/plan:text-emerald-500 transition-colors">{plan.name} CYCLE</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30 italic">Duration: {plan.durationDays} Grid Days</p>
                 </div>
                 <div className="flex flex-col items-center md:items-end gap-3">
                    <p className="text-4xl font-black italic tracking-tighter group-hover/plan:text-emerald-500 transition-colors">₹{plan.price}</p>
                    <div className="flex items-center gap-3 opacity-20">
                       <Cpu className="w-4 h-4" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Regional Dividend Unit</span>
                    </div>
                 </div>
              </div>
            </button>
          ))}
        </div>

        {!isActive && (
          <div className="p-8 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 flex items-center gap-6 animate-pulse italic">
             <AlertCircle className="w-8 h-8 text-rose-500 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
             <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-relaxed opacity-60">
               L7 Node Authentication Required. Initialize subscription to synchronize with the regional dispatch lattice.
             </p>
          </div>
        )}
      </div>

      <footer className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-10 opacity-10 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-3">
            <Fingerprint className="w-3 h-3 text-emerald-500" />
            <p className="text-[8px] font-black uppercase tracking-[0.5em] italic">Private Hash Secure</p>
         </div>
         <div className="flex items-center gap-3">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <p className="text-[8px] font-black uppercase tracking-[0.5em] italic">Cluster v9.4.S</p>
         </div>
      </footer>
    </div>
  );
}
