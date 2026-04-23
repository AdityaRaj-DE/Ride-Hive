import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { onboardVehicle } from "../store/slices/driverSlice";
import type { AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";
import { Car, Hash, Palette, Info, ArrowRight, ShieldCheck, ChevronDown, Activity, Zap } from 'lucide-react';

export default function Vehicle() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [model, setModel] = useState("");
  const [plateNumber, setPlate] = useState("");
  const [color, setColor] = useState("");
  const [type, setType] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(
      onboardVehicle({ model, plateNumber, color, type })
    );
    if (onboardVehicle.fulfilled.match(res)) {
      navigate("/driver/onboarding/documents");
    }
  };

  return (
    <div className="min-h-screen text-primary flex items-center justify-center p-6 sm:p-10 pb-24">
      <div className="w-full max-w-5xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-16 text-center space-y-6">
           <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20 shadow-2xl backdrop-blur-2xl">
                 <Car className="w-7 h-7" />
              </div>
              <div className="px-5 py-2 rounded-full bg-surface border border-border text-accent text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                 Phase 02: Logistics Registration
              </div>
           </div>
           <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-primary leading-tight uppercase">
             Partner <span className="text-accent underline decoration-4 underline-offset-14">Unit</span>
           </h1>
           <p className="text-secondary text-base md:text-xl font-medium max-w-3xl mx-auto opacity-60 leading-relaxed uppercase tracking-tight italic px-4">
             Link your professional transport asset to the global grid node for operational authorization.
           </p>
        </header>

        <div className="glass-card p-10 md:p-16 border-accent/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl rounded-[3rem]">
           <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none rotate-12 transition-transform duration-1000 group-hover:rotate-0">
              <Activity className="w-80 h-80 text-accent" />
           </div>

           <form onSubmit={submit} className="space-y-12 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4 group">
                  <label className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.2em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                    <Car className="w-4 h-4" />
                    Asset Model
                  </label>
                  <input
                    placeholder="e.g. Tesla Model S"
                    className="w-full px-8 py-5 bg-surface border border-border rounded-2xl outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all font-bold text-xl text-primary placeholder:text-muted/10 uppercase tracking-tight"
                    onChange={e => setModel(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-4 group">
                  <label className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.2em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                    <Hash className="w-4 h-4" />
                    Identification Tag
                  </label>
                  <input
                    placeholder="HEX-4402"
                    className="w-full px-8 py-5 bg-surface border border-border rounded-2xl outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all font-bold text-xl text-accent placeholder:text-muted/10 uppercase tracking-[0.3em]"
                    onChange={e => setPlate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-4 group">
                  <label className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.2em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                    <Palette className="w-4 h-4" />
                    Shell Color
                  </label>
                  <input
                    placeholder="e.g. Obsidian Black"
                    className="w-full px-8 py-5 bg-surface border border-border rounded-2xl outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all font-bold text-xl text-primary placeholder:text-muted/10 uppercase"
                    onChange={e => setColor(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-4 group">
                  <label className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.2em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                    <Info className="w-4 h-4" />
                    Unit Classification
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full px-8 py-5 bg-surface border border-border rounded-2xl outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all font-bold text-xl text-primary appearance-none cursor-pointer uppercase tracking-tight"
                      onChange={e => setType(e.target.value)}
                      required
                    >
                      <option value="" disabled selected>Select Specification</option>
                      <option value="Sedan">Sedan Elite</option>
                      <option value="SUV">Utility X</option>
                      <option value="Luxury">Prime Luxury</option>
                      <option value="Hatchback">Regional Compact</option>
                    </select>
                    <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-muted opacity-20 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-accent/5 border border-accent/10 flex items-center gap-8 relative overflow-hidden group/info">
                 <div className="absolute top-0 right-0 w-1 h-full bg-accent opacity-20 group-hover/info:opacity-100 transition-opacity"></div>
                 <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0 shadow-xl shadow-accent/5 transition-transform group-hover/info:rotate-12">
                    <ShieldCheck className="w-8 h-8 text-accent" />
                 </div>
                 <p className="text-xs font-bold text-secondary leading-relaxed opacity-60 uppercase tracking-widest italic group-hover/info:opacity-80 transition-opacity">
                   Asset metadata will be cross-referenced with regional logistics registries. Ensure absolute parity with your physical registration for instant node clearance.
                 </p>
              </div>

              <button
                className="btn-primary w-full h-18 text-[11px] font-bold tracking-[0.4em] gap-5 shadow-2xl shadow-accent/30 active:scale-95"
              >
                <span>PROCEED TO VAULT SUBMISSION</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
           </form>
        </div>
      </div>
      
      <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 text-center opacity-30 w-full px-6 flex flex-col items-center gap-6">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
               <Zap size={14} className="text-accent" />
               <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Direct Link Protocol</p>
            </div>
            <div className="w-1 h-1 rounded-full bg-border"></div>
            <div className="flex items-center gap-2">
               <Activity size={14} className="text-accent" />
               <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Latency: 8ms</p>
            </div>
         </div>
         <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-muted">Hive Partner OS • Logistics Integrity Service</p>
      </footer>
    </div>
  );
}
