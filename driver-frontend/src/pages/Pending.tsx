import React from 'react';
import { Clock, ShieldCheck, ArrowLeft, Fingerprint, Activity, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-primary flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-3xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="glass-card p-10 md:p-16 border-accent/10 shadow-xl relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12">
              <ShieldCheck className="w-64 h-64 text-accent" />
           </div>

           <header className="space-y-8 relative z-10">
              <div className="flex items-center justify-center mb-10">
                 <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20 shadow-sm transition-all hover:scale-105">
                    <Clock className="w-10 h-10 animate-pulse" />
                 </div>
              </div>
              
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/5 text-accent rounded-full border border-accent/10 text-[10px] font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    Verification in Progress
                 </div>
                 <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
                    Reviewing <span className="text-accent">Profile</span>
                 </h1>
                 <p className="text-secondary text-base font-medium max-w-xl mx-auto opacity-60">
                    We are currently verifying your driver credentials and vehicle documents. This usually takes 24-48 hours.
                 </p>
              </div>
           </header>

           <main className="mt-12 space-y-4 max-w-md mx-auto relative z-10">
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface border border-border shadow-sm group">
                 <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 transition-transform group-hover:rotate-6">
                    <Fingerprint className="w-6 h-6" />
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5">Identity Verified</p>
                    <p className="text-xs font-medium text-secondary opacity-60">Primary background check successfully completed.</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface border border-border shadow-sm group opacity-70">
                 <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                    <ShieldAlert className="w-6 h-6" />
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5">Document Audit</p>
                    <p className="text-xs font-medium text-secondary opacity-60">We are reviewing your insurance and vehicle registration.</p>
                 </div>
              </div>
           </main>

           <footer className="mt-16 pt-10 border-t border-border relative z-10">
              <button 
                onClick={() => navigate('/driver/login')}
                className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-accent transition-all mx-auto group opacity-40 hover:opacity-100"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Return to Login
              </button>

              <div className="mt-12 flex items-center justify-center gap-8 opacity-20 grayscale">
                 <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-accent" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Real-time Status</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Secure Verification</p>
                 </div>
              </div>
           </footer>
        </div>
      </div>
      
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center opacity-20 w-full px-6">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hive OS • Trust & Safety Protocol</p>
      </footer>
    </div>
  );
}