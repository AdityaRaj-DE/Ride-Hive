import { CheckCircle, ArrowRight, Zap, Wallet, Banknote } from 'lucide-react';
import QRCode from "react-qr-code";

export default function RideCompleted({ ride, onDone }: { ride: any, onDone: () => void }) {
  const isWallet = ride.paymentMethod === "WALLET";
  const finalPrice = ride.finalPrice || ride.price || 0;

  return (
    <div className="premium-card p-10 sm:p-14 glass-panel shadow-[0_128px_256px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl rounded-[3.5rem] sm:rounded-[4.5rem] relative overflow-hidden animate-in zoom-in-95 duration-1000 flex flex-col items-center justify-center text-center group max-h-[95vh] overflow-y-auto">
      {/* Success Aurora Overlay */}
      <div className={`absolute inset-0 ${!isWallet ? 'bg-emerald-500/10' : 'bg-indigo-500/5'} animate-pulse z-0`}></div>
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className={`w-24 h-24 rounded-3xl ${!isWallet ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-indigo-500/20 border-indigo-500/30'} border flex items-center justify-center mb-8 mx-auto shadow-2xl group-hover:rotate-12 transition-transform duration-700`}>
            {!isWallet ? (
               <CheckCircle className="w-12 h-12 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
            ) : (
               <Wallet className="w-12 h-12 text-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
            )}
        </div>
        
        <div className="space-y-4 mb-12 text-center">
           <div className="flex items-center justify-center gap-4">
              <Zap className={`w-5 h-5 ${!isWallet ? 'text-emerald-500' : 'text-indigo-500'}`} />
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                {isWallet ? "Settle " : "Ride "}
                <span className={!isWallet ? "text-emerald-500" : "text-indigo-500"}>
                  {isWallet ? "Transaction" : "Completed"}
                </span>
              </h2>
           </div>
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-50 max-w-[300px] mx-auto leading-relaxed italic">
              {isWallet ? "Digital wallet deduction processed successfully." : "Please facilitate cash payment to your driver."}
           </p>
        </div>

        {/* Payment Summary */}
        <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 mb-10 space-y-8 relative overflow-hidden group/price">
           <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/price:opacity-100 transition-opacity"></div>
           
           <div className="space-y-2 relative z-10">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Final Payable Amount</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-white/40 mt-2">₹</span>
                <p className="text-7xl font-black italic tracking-tighter text-white drop-shadow-2xl">
                  {finalPrice}
                </p>
              </div>
           </div>
           
           <div className={`flex items-center justify-center gap-4 py-4 px-8 rounded-2xl border transition-colors ${
             isWallet ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
           }`}>
              {isWallet ? <Wallet className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
              <p className="text-[11px] font-black uppercase tracking-[0.2em]">
                {isWallet ? "Digital Transfer Complete" : "Cash Payment Mode"}
              </p>
           </div>

           {isWallet && (
             <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in duration-1000">
                <div className="p-5 bg-white rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform">
                   <QRCode 
                     value={`ride_hive_pay_${ride.rideId}_${finalPrice}`} 
                     size={160}
                     level="H"
                   />
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>
                   <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Transaction archived online</p>
                </div>
             </div>
           )}

           {!isWallet && (
             <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 space-y-2">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Instruction</p>
                <p className="text-xs font-bold text-primary italic">Confirm payment with driver before closing.</p>
             </div>
           )}
        </div>

        <button 
          onClick={onDone} 
          className={`w-full h-24 rounded-[2.5rem] ${!isWallet ? 'bg-emerald-500 shadow-[0_32px_64px_rgba(16,185,129,0.3)]' : 'bg-indigo-500 shadow-[0_32px_64px_rgba(99,102,241,0.3)]'} text-white font-black uppercase italic text-base tracking-[0.5em] hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center justify-center gap-6 group/btn relative overflow-hidden`}
        >
           <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
           <span className="relative z-10 flex items-center gap-4">
              Finish Journey
              <ArrowRight className="w-8 h-8 group-hover/btn:translate-x-3 transition-transform" />
           </span>
        </button>

        <div className="mt-8 flex items-center justify-center gap-4 opacity-20 pointer-events-none">
           <CheckCircle className="w-4 h-4" />
           <p className="text-[10px] font-black uppercase tracking-[0.8em]">End of Mission Protocol</p>
        </div>
      </div>
    </div>
  );
}