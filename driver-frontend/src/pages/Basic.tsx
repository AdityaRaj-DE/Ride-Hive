import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { onboardBasic } from "../store/slices/driverSlice";
import type { AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, ArrowRight, Activity, Fingerprint, ShieldCheck } from 'lucide-react';

export default function Basic() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [firstname, setFirst] = useState("");
  const [lastname, setLast] = useState("");
  const [licenseNumber, setLicense] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(
      onboardBasic({ firstname, lastname, licenseNumber })
    );
    if (onboardBasic.fulfilled.match(res)) {
      navigate("/driver/onboarding/vehicle");
    }
  };

  return (
    <div className="text-primary p-mobile-safe">
      <div className="w-full max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-12 text-center space-y-4">
           <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20 shadow-sm backdrop-blur-md">
                 <Fingerprint className="w-6 h-6" />
              </div>
              <div className="px-4 py-2 rounded-full bg-surface border border-border text-accent text-[10px] font-bold uppercase tracking-widest">
                 Step 1: Driver Profile
              </div>
           </div>
           <h1 className="text-4xl sm:text-7xl font-bold tracking-tight text-primary leading-tight">
             Basic <span className="text-accent">Details</span>
           </h1>
           <p className="text-secondary text-base font-medium max-w-2xl mx-auto opacity-60">
             Welcome to the Hive. Please provide your legal information to begin your journey as a specialized logistics partner.
           </p>
        </header>

        <div className="glass-card p-6 sm:p-12 border-accent/10 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12">
              <ShieldCheck className="w-64 h-64 text-accent" />
           </div>

           <form onSubmit={submit} className="space-y-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                    <User className="w-3.5 h-3.5" />
                    First Name
                  </label>
                  <input
                    placeholder="e.g. John"
                    className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-base sm:text-lg text-primary placeholder:text-muted/20"
                    onChange={e => setFirst(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                    <User className="w-3.5 h-3.5" />
                    Last Name
                  </label>
                  <input
                    placeholder="e.g. Doe"
                    className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-base sm:text-lg text-primary placeholder:text-muted/20"
                    onChange={e => setLast(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  Driving License Number
                </label>
                <div className="relative">
                  <input
                    placeholder="DL-0000-0000-0000"
                    className="w-full px-6 py-4 sm:py-5 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-bold text-lg sm:text-2xl tracking-[0.1em] sm:tracking-[0.2em] text-accent placeholder:text-muted/10 uppercase"
                    onChange={e => setLicense(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-accent/5 border border-accent/10 rounded-xl w-fit">
                   <Activity className="w-3.5 h-3.5 text-accent" />
                   <p className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">Identity will be verified via regional transport authorities.</p>
                </div>
              </div>

              <button
                className="btn-primary w-full h-14 sm:h-16 text-xs sm:text-sm gap-3 sm:gap-4"
              >
                <span>Continue to Vehicle Details</span>
                <ArrowRight className="w-5 h-5" />
              </button>
           </form>
        </div>
      </div>
      
      <footer className="mt-20 text-center opacity-20 w-full px-6">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hive OS • Trust & Safety Protocol</p>
      </footer>
    </div>
  );
}
