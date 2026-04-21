import { CheckCircle, ArrowRight, ShieldCheck, Zap, Wallet, Banknote } from 'lucide-react';
import QRCode from "react-qr-code";

export default function RideCompleted({ ride, onDone }: { ride: any, onDone: () => void }) {
  const isWallet = ride.paymentMethod === "WALLET";
  const finalPrice = ride.finalPrice || ride.price || 0;

  return (
    <div className="premium-card p-8 sm:p-12 glass-panel shadow-[0_128px_256px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl rounded-[3rem] sm:rounded-[4rem] relative overflow-hidden animate-in zoom-in-95 duration-1000 flex flex-col items-center justify-center text-center group max-h-[90vh] overflow-y-auto">
      {/* Success Aurora Overlay */}
      <div className="absolute inset-0 bg-indigo-500/5 animate-pulse z-0"></div>
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 mx-auto shadow-2xl group-hover:rotate-12 transition-transform duration-700">
            <CheckCircle className="w-10 h-10 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]" />
        </div>
        
        <div className="space-y-4 mb-8 text-center">
           <div className="flex items-center justify-center gap-4">
              <Zap className="w-4 h-4 text-indigo-500" />
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Trajectory <span className="text-indigo-500">Fulfilled</span></h2>
           </div>
           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 max-w-[250px] mx-auto leading-relaxed italic">
              Spatial transition complete.
           </p>
        </div>

        {/* Payment Summary */}
        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 space-y-6">
           <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Final Amount</p>
              <p className="text-5xl font-black italic tracking-tighter text-white">₹{finalPrice}</p>
           </div>
           
           <div className="flex items-center justify-center gap-4 bg-white/5 py-3 px-6 rounded-2xl border border-white/5">
              {isWallet ? <Wallet className="w-4 h-4 text-indigo-400" /> : <Banknote className="w-4 h-4 text-emerald-400" />}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                {isWallet ? "Digital Wallet Transfer" : "Cash Received by Driver"}
              </p>
           </div>

           {isWallet && (
             <div className="flex flex-col items-center gap-6 py-4">
                <div className="p-4 bg-white rounded-2xl shadow-2xl">
                   <QRCode 
                     value={`ride_hive_pay_${ride.rideId}_${finalPrice}`} 
                     size={140}
                     level="H"
                   />
                </div>
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Scan to archive transaction</p>
             </div>
           )}
        </div>

        <button 
          onClick={onDone} 
          className="w-full h-20 rounded-[2rem] bg-indigo-500 text-white font-black uppercase italic text-sm tracking-[0.4em] shadow-[0_48px_96px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center justify-center gap-6 group/btn relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
           <span className="relative z-10 flex items-center gap-4">
              Next Protocol <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
           </span>
        </button>

        <div className="mt-8 flex items-center justify-center gap-4 opacity-10 pointer-events-none">
           <ShieldCheck className="w-3 h-3" />
           <p className="text-[8px] font-black uppercase tracking-[1em]">Node Signature Archived</p>
        </div>
      </div>
    </div>
  );
}