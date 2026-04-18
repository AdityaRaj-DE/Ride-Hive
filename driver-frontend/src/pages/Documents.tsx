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
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-20 text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-16 h-16 bg-accent/5 rounded-2xl flex items-center justify-center text-accent border border-accent/10 shadow-sm">
                   <UploadCloud className="w-8 h-8" />
                </div>
                <div className="px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Document Submission</span>
                </div>
             </div>
             <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
               Registration <span className="text-accent underline decoration-4 underline-offset-14">Vault</span>
             </h1>
             <p className="text-secondary text-base md:text-xl font-medium max-w-2xl mx-auto md:mx-0 opacity-60 leading-relaxed uppercase tracking-tight">
               Upload your professional credentials to the Hive grid for validation and pilot authorization.
             </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-4 opacity-20 hover:opacity-100 transition-opacity duration-500">
             <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</p>
                <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-accent">
                   <ShieldCheck className="w-5 h-5" />
                </div>
             </div>
             <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest">Regional Compliance Hub</p>
                <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-accent">
                   <Globe className="w-5 h-5" />
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           {/* Sidebar Instructions */}
           <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
              <div className="glass-card p-10 border-accent/10 shadow-xl rounded-3xl backdrop-blur-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none rotate-12 translate-x-4">
                    <ShieldQuestion className="w-48 h-48 text-accent" />
                 </div>
                 
                 <header className="mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                       <ShieldQuestion className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Verification Guide</h3>
                 </header>

                 <div className="space-y-6 px-1 relative z-10">
                    {[
                      'Clear digital scans or photos only (JPG/PNG).',
                      'All edges of the document must be visible.',
                      'No blurred text or obscured identifying numbers.',
                      'Document must be current and not expired.'
                    ].map((rule, idx) => (
                      <div key={idx} className="flex gap-4 group/row">
                         <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-0.5 border border-accent/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                         </div>
                         <p className="text-[11px] font-bold text-muted uppercase tracking-widest leading-relaxed opacity-40 group-hover/row:opacity-100 transition-opacity">{rule}</p>
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-10 pt-8 border-t border-border flex flex-col gap-4 opacity-40">
                    <div className="flex items-center gap-3">
                       <Activity className="w-4 h-4 text-accent animate-pulse" />
                       <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Secure submission link active</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="w-4 h-4 text-accent" />
                       <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Biometric Privacy Compliant</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Form Card */}
           <div className="lg:col-span-8 order-1 lg:order-2">
              <form onSubmit={submit} className="glass-card p-10 md:p-14 border-accent/10 shadow-2xl relative overflow-hidden flex flex-col justify-center rounded-[3rem] backdrop-blur-xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    <div className="space-y-3 group">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                        <FileText className="w-3.5 h-3.5" />
                        Driving License URL
                      </label>
                      <input
                        placeholder="https://imgur.com/your-license.jpg"
                        className="w-full px-6 py-4 bg-surface border border-border rounded-xl font-bold text-sm text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 tracking-widest"
                        onChange={e => setDl(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-3 group">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                        <FileText className="w-3.5 h-3.5" />
                        RC Book / Registration URL
                      </label>
                      <input
                        placeholder="https://imgur.com/your-rcbook.jpg"
                        className="w-full px-6 py-4 bg-surface border border-border rounded-xl font-bold text-sm text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 tracking-widest"
                        onChange={e => setRc(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-3 group">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                         <ShieldCheck className="w-3.5 h-3.5" />
                         Insurance Certificate URL
                      </label>
                      <input
                        placeholder="https://imgur.com/your-insurance.jpg"
                        className="w-full px-6 py-4 bg-surface border border-border rounded-xl font-bold text-sm text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 tracking-widest"
                        onChange={e => setIns(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-3 group">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                         <Camera className="w-3.5 h-3.5" />
                         Recent Profile Photo URL
                      </label>
                      <input
                        placeholder="https://imgur.com/your-profile-photo.jpg"
                        className="w-full px-6 py-4 bg-surface border border-border rounded-xl font-bold text-sm text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 tracking-widest"
                        onChange={e => setPhoto(e.target.value)}
                        required
                      />
                    </div>
                 </div>

                 <button
                    className="btn-primary w-full mt-12 h-16 text-sm gap-4"
                 >
                    <span>Finalize Secure Submission</span>
                    <ArrowRight className="w-5 h-5" />
                 </button>
                 
                 <footer className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                       <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Cloud registry ready</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-border md:block hidden"></div>
                    <div className="flex items-center gap-2">
                       <Activity className="w-3.5 h-3.5 text-accent" />
                       <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Vault connection stable</p>
                    </div>
                 </footer>
              </form>
           </div>
        </div>

        <footer className="mt-32 text-center space-y-6 opacity-20 hover:opacity-100 transition-all duration-700 pb-16 px-6">
           <div className="flex items-center justify-center gap-4">
              <span className="h-px w-20 bg-border"></span>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted">Hive OS Partner Portal v2.4.0</p>
              <span className="h-px w-20 bg-border"></span>
           </div>
           <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
              All document hashes are checked against regional databases. Inaccurate or fraudulent submissions will result in immediate partner node de-authorization.
           </p>
        </footer>
      </div>
    </div>
  );
}
