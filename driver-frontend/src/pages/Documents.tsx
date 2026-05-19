import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { onboardDocuments } from "../store/slices/driverSlice";
import type { AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";
import { FileText, Camera, ShieldCheck, UploadCloud, CheckCircle2, Activity, Globe, ShieldQuestion, ArrowRight } from 'lucide-react';

export default function Documents() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [dl, setDl] = useState("");
  const [rc, setRc] = useState("");
  const [ins, setIns] = useState("");
  const [photo, setPhoto] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(
      onboardDocuments({
        drivingLicenseUrl: dl,
        rcBookUrl: rc,
        insuranceUrl: ins,
        profilePhotoUrl: photo,
      })
    );
    if (onboardDocuments.fulfilled.match(res)) {
      navigate("/driver/onboarding/pending");
    }
  };

  return (
    <div className="text-primary p-mobile-safe">
      <div className="max-w-5xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-20 text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-10">
          <div className="space-y-6">
             <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20 shadow-2xl backdrop-blur-2xl">
                   <UploadCloud className="w-8 h-8" />
                </div>
                <div className="px-5 py-2.5 rounded-full bg-surface border border-border text-accent flex items-center gap-4 shadow-xl">
                   <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.6)]"></div>
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Phase 03: Document Authentication</span>
                </div>
             </div>
             <h1 className="text-3xl sm:text-5xl md:text-8xl font-bold tracking-tighter text-primary leading-tight uppercase">
                Registration <span className="text-accent underline decoration-4 underline-offset-14 italic">Vault</span>
              </h1>
             <p className="text-secondary text-base md:text-xl font-medium max-w-3xl mx-auto md:mx-0 opacity-60 leading-relaxed uppercase tracking-tight italic">
               Upload your professional credentials to the global logistics grid for multi-stage validation and final node authorization.
             </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-6 opacity-30 hover:opacity-100 transition-opacity duration-700">
             <div className="flex items-center gap-4 group cursor-default">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] group-hover:text-accent transition-colors">Quantum Encrypted</p>
                <div className="w-12 h-12 rounded-2xl border border-border flex items-center justify-center text-accent bg-surface/50 shadow-xl">
                   <ShieldCheck className="w-6 h-6" />
                </div>
             </div>
             <div className="flex items-center gap-4 group cursor-default">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] group-hover:text-accent transition-colors">Compliance Engine</p>
                <div className="w-12 h-12 rounded-2xl border border-border flex items-center justify-center text-accent bg-surface/50 shadow-xl">
                   <Globe className="w-6 h-6" />
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           {/* Sidebar Instructions */}
           <div className="lg:col-span-4 space-y-10 order-2 lg:order-1">
              <div className="glass-card p-6 sm:p-12 border-accent/10 shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.015] pointer-events-none rotate-[25deg] transition-transform duration-1000 group-hover:rotate-0">
                    <ShieldQuestion className="w-64 h-64 text-accent" />
                 </div>
                 
                 <header className="mb-6 sm:mb-10 flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent/20">
                       <ShieldQuestion className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tighter text-primary">Capture Protocol</h3>
                 </header>

                 <div className="space-y-8 px-1 relative z-10">
                    {[
                      'High-resolution digital scans (1200 DPI recommended).',
                      'Full bleed capture (all four corners visible).',
                      'Zero occlusion of alphanumeric link strings.',
                      'Temporal validity check for all licenses.'
                    ].map((rule, idx) => (
                      <div key={idx} className="flex gap-5 group/row cursor-default">
                         <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5 border border-accent/20 group-hover/row:scale-110 transition-transform shadow-inner">
                            <CheckCircle2 className="w-4 h-4 text-accent" />
                         </div>
                         <p className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] leading-relaxed opacity-40 group-hover/row:opacity-100 transition-opacity italic">{rule}</p>
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-12 pt-10 border-t border-border flex flex-col gap-5 opacity-40 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4">
                       <Activity className="w-5 h-5 text-accent animate-pulse" />
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted leading-none">Authentication Link: Active</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <ShieldCheck className="w-5 h-5 text-accent" />
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted leading-none">Privacy Guard: Engaged</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Form Card */}
           <div className="lg:col-span-8 order-1 lg:order-2">
              <form onSubmit={submit} className="glass-card p-6 sm:p-16 border-accent/10 shadow-2xl relative overflow-hidden flex flex-col justify-center rounded-[2.5rem] sm:rounded-[4rem] backdrop-blur-2xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 w-full">
                    <div className="space-y-4 group">
                      <label className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.3em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                        <FileText className="w-4 h-4" />
                        License Number 
                      </label>
                      <input
                        placeholder="Enter License Number"
                        className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-surface border border-border rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-primary outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-muted/10 tracking-[0.1em] sm:tracking-[0.2em] uppercase"
                        onChange={e => setDl(e.target.value)}
                        required
                      />
                      <div className="mt-3">
                        <button className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.3em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                           
                           verify
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4 group">
                      <label className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.3em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                        <FileText className="w-4 h-4" />
                        Registration Number 
                      </label>
                      <input
                        placeholder="Enter Registration Number"
                        className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-surface border border-border rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-primary outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-muted/10 tracking-[0.1em] sm:tracking-[0.2em] uppercase"
                        onChange={e => setRc(e.target.value)}
                        required
                      />
                      <div className="mt-3">
                        <button className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.3em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                           
                           verify
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 group">
                      <label className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.3em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                         <ShieldCheck className="w-4 h-4" />
                         Insurance Number
                      </label>
                      <input
                        placeholder="Enter Insurance Number"
                        className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-surface border border-border rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-primary outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-muted/10 tracking-[0.1em] sm:tracking-[0.2em] uppercase"
                        onChange={e => setIns(e.target.value)}
                        required
                      />
                      <div className="mt-3">
                        <button className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.3em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                           
                           verify
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 group">
                      <label className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.3em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                         <Camera className="w-4 h-4" />
                         Addhar Number
                      </label>
                      <input
                        placeholder="Enter Addhar Number"
                        className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-surface border border-border rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-primary outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-muted/10 tracking-[0.1em] sm:tracking-[0.2em] uppercase"
                        onChange={e => setPhoto(e.target.value)}
                        required
                      />
                      <div className="mt-3">
                        <button className="flex items-center gap-3 text-[10px] font-bold text-accent uppercase tracking-[0.3em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                           
                           verify
                        </button>
                      </div>
                    </div>
                 </div>

                 <button
                    className="btn-primary w-full mt-10 sm:mt-16 h-16 sm:h-20 text-[10px] sm:text-[11px] font-bold tracking-[0.3em] sm:tracking-[0.5em] gap-3 sm:gap-5 shadow-2xl shadow-accent/40 active:scale-95"
                 >
                    <span>INITIATE GRID SYNC</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                 </button>
                 
                 <footer className="mt-16 pt-10 border-t border-border flex flex-col md:flex-row items-center justify-center gap-12 opacity-30 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                       <CheckCircle2 className="w-4 h-4 text-accent" />
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Astra Ledger Ready</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-border md:block hidden"></div>
                    <div className="flex items-center gap-3">
                       <Activity className="w-4 h-4 text-accent animate-pulse" />
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Network Hub: Stable</p>
                    </div>
                 </footer>
              </form>
           </div>
        </div>

        <footer className="mt-40 text-center space-y-8 opacity-20 hover:opacity-100 transition-all duration-1000 pb-20 px-6">
           <div className="flex items-center justify-center gap-12">
              <div className="h-px w-24 bg-border/50"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-muted">Hive OS Partner Portal v2.4.0</p>
              <div className="h-px w-24 bg-border/50"></div>
           </div>
           <p className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] max-w-4xl mx-auto leading-relaxed border border-border/10 p-8 rounded-[2rem]">
              All document hashes are checked against regional logistics databases via the Hive Oracle network. Inaccurate or fraudulent submissions will result in immediate partner node de-authorization and collateral forfeiture.
           </p>
        </footer>
      </div>
    </div>
  );
}
