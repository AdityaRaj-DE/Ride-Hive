import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { onboardVehicle } from "../store/slices/driverSlice";
import type { AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";
import { Car, Hash, Palette, Info, ArrowRight, ShieldCheck, ChevronDown, Activity } from 'lucide-react';

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
    <div className="min-h-screen text-primary flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-4xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-12 text-center space-y-4">
           <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20 shadow-sm backdrop-blur-md">
                 <Car className="w-6 h-6" />
              </div>
              <div className="px-4 py-2 rounded-full bg-surface border border-border text-accent text-[10px] font-bold uppercase tracking-widest">
                 Step 2: Vehicle Details
              </div>
           </div>
           <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
             Register <span className="text-accent">Vehicle</span>
           </h1>
           <p className="text-secondary text-base font-medium max-w-2xl mx-auto opacity-60">
             Provide your vehicle information to complete the onboarding process and start receiving ride requests.
           </p>
        </header>

        <div className="glass-card p-8 md:p-12 border-accent/10 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12">
              <Activity className="w-64 h-64 text-accent" />
           </div>

           <form onSubmit={submit} className="space-y-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                    <Car className="w-3.5 h-3.5" />
                    Vehicle Model
                  </label>
                  <input
                    placeholder="e.g. Toyota Camry"
                    className="w-full px-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary placeholder:text-muted/20"
                    onChange={e => setModel(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                    <Hash className="w-3.5 h-3.5" />
                    License Plate
                  </label>
                  <input
                    placeholder="ABC-1234"
                    className="w-full px-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-accent placeholder:text-muted/20 uppercase tracking-widest"
                    onChange={e => setPlate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                    <Palette className="w-3.5 h-3.5" />
                    Exterior Color
                  </label>
                  <input
                    placeholder="e.g. Silver Metallic"
                    className="w-full px-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary placeholder:text-muted/20"
                    onChange={e => setColor(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                    <Info className="w-3.5 h-3.5" />
                    Vehicle Classification
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full px-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary appearance-none cursor-pointer"
                      onChange={e => setType(e.target.value)}
                      required
                    >
                      <option value="" disabled selected>Select Category</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Hatchback">Hatchback</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-40 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10 flex items-center gap-6">
                 <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
                    <ShieldCheck className="w-6 h-6 text-accent" />
                 </div>
                 <p className="text-[11px] font-medium text-secondary leading-relaxed opacity-60">
                   Vehicle details will be verified against official regional databases to ensure grid compliance and safety.
                 </p>
              </div>

              <button
                className="btn-primary w-full h-16 text-sm gap-4"
              >
                <span>Continue to Documents</span>
                <ArrowRight className="w-5 h-5" />
              </button>
           </form>
        </div>
      </div>
      
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center opacity-20 w-full px-6">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hive OS • Secure Driver Onboarding</p>
      </footer>
    </div>
  );
}
