import { Clock, ShieldCheck, ArrowLeft, Fingerprint, Activity, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pending() {
  const navigate = useNavigate();

  return (
    <div className="text-primary p-mobile-safe">
      <div className="w-full max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="glass-card p-8 sm:p-20 border-accent/10 shadow-2xl relative overflow-hidden text-center rounded-[2rem] sm:rounded-[4rem] backdrop-blur-2xl">
           <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none rotate-12 transition-transform duration-1000 group-hover:rotate-0">
              <ShieldCheck className="w-80 h-80 text-accent" />
           </div>

           <header className="space-y-10 relative z-10">
              <div className="flex items-center justify-center mb-12">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent/10 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-accent border border-accent/20 shadow-2xl shadow-accent/10 transition-all hover:scale-110 group">
                     <Clock className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse group-hover:rotate-12 transition-transform" />
                  </div>
              </div>
              
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-accent/5 text-accent rounded-full border border-accent/10 text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                    Verification Phase: Delta
                 </div>
                  <h1 className="text-3xl sm:text-5xl md:text-8xl font-bold tracking-tighter text-primary leading-tight uppercase">
                     Status <span className="text-accent italic">Sync</span>
                  </h1>
                 <p className="text-secondary text-base md:text-xl font-medium max-w-2xl mx-auto opacity-60 leading-relaxed uppercase tracking-tight italic">
                    The Oracle network is currently verifying your professional blueprints and logistics telemetry across regional nodes.
                 </p>
              </div>
           </header>

           <main className="mt-16 space-y-6 max-w-lg mx-auto relative z-10">
               <div className="flex items-center gap-6 sm:gap-8 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface/50 border border-border shadow-2xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 h-full bg-accent opacity-20"></div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 transition-transform group-hover:rotate-12 shadow-inner">
                     <Fingerprint className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent mb-1 leading-none">Identity Secured</p>
                     <p className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-[0.1em] opacity-40">Background Check: [SUCCESS]</p>
                  </div>
               </div>
              
               <div className="flex items-center gap-6 sm:gap-8 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface/30 border border-border/50 shadow-xl group relative overflow-hidden opacity-60">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10 transition-all group-hover:rotate-6">
                     <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted mb-1 leading-none">Logistics Audit</p>
                     <p className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-[0.1em] opacity-40 italic">Reviewing Assets...</p>
                  </div>
               </div>
           </main>

           <footer className="mt-20 pt-12 border-t border-border/50 relative z-10">
              <button 
                onClick={() => navigate('/driver/login')}
                className="flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-secondary hover:text-accent transition-all mx-auto group opacity-40 hover:opacity-100 italic"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-3 transition-transform" />
                DICONNECT NODE
              </button>

              <div className="mt-16 flex items-center justify-center gap-12 opacity-30">
                 <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-accent animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Real-time Status</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Quantum Trust</p>
                 </div>
              </div>
           </footer>
        </div>
      </div>
      
      <footer className="mt-20 text-center opacity-30 w-full px-6">
         <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-muted">HIVE OS • TRUST & SAFETY PROTOCOL DELTA-09</p>
      </footer>
    </div>
  );
}