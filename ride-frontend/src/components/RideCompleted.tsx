import { CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function RideCompleted({ onDone }: { onDone: () => void }) {
  return (
    <div className="premium-card p-12 glass-panel shadow-[0_128px_256px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl rounded-[4rem] relative overflow-hidden animate-in zoom-in-95 duration-1000 flex flex-col items-center justify-center text-center group">
      {/* Success Aurora Overlay */}
      <div className="absolute inset-0 bg-indigo-500/5 animate-pulse z-0"></div>
      
      <div className="relative z-10 w-full">
        <div className="w-24 h-24 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-10 mx-auto shadow-2xl group-hover:rotate-12 transition-transform duration-700">
            <CheckCircle className="w-12 h-12 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]" />
        </div>
        
        <div className="space-y-4 mb-14">
           <div className="flex items-center justify-center gap-4">
              <Zap className="w-4 h-4 text-indigo-500" />
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Trajectory <span className="text-indigo-500">Fulfilled</span></h2>
           </div>
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.6em] opacity-40 max-w-[300px] mx-auto leading-relaxed italic">
              Your spatial transition across the nocturnal grid is successfully complete. Node signature archived.
           </p>
        </div>

        <button 
          onClick={onDone} 
          className="w-full h-24 rounded-[2.5rem] bg-indigo-500 text-white font-black uppercase italic text-sm tracking-[0.6em] shadow-[0_64px_128px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center justify-center gap-8 group/btn relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
           <span className="relative z-10 flex items-center gap-6">
              Initiate New Protocol <ArrowRight className="w-8 h-8 group-hover/btn:translate-x-3 transition-transform" />
           </span>
        </button>

        <div className="mt-12 flex items-center justify-center gap-6 opacity-10 py-2 pointer-events-none">
           <ShieldCheck className="w-4 h-4" />
           <p className="text-[9px] font-black uppercase tracking-[1.2em]">Session Securely Ternimated</p>
        </div>
      </div>
    </div>
  );
}