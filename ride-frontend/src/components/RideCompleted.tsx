import { CheckCircle, ArrowRight, Zap, Wallet, Banknote } from 'lucide-react';
import QRCode from "react-qr-code";

export default function RideCompleted({ ride, onDone }: { ride: any, onDone: () => void }) {
  const isWallet = ride.paymentMethod === "WALLET";
  const finalPrice = ride.finalPrice || ride.price || 0;

  return (
    <div className="premium-card p-6 sm:p-14 glass-panel shadow-[0_32px_128px_rgba(0,0,0,0.2)] dark:shadow-[0_128px_256px_rgba(0,0,0,0.8)] border border-border/50 backdrop-blur-3xl rounded-[2.5rem] sm:rounded-[4.5rem] relative overflow-hidden animate-in zoom-in-95 duration-700 flex flex-col items-center justify-center text-center group max-h-[90vh] overflow-y-auto no-scrollbar">
      {/* Success Aurora Overlay */}
      <div className={`absolute inset-0 ${!isWallet ? 'bg-emerald-500/5' : 'bg-indigo-500/5'} animate-pulse z-0`}></div>
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl ${!isWallet ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-indigo-500/10 border-indigo-500/20'} border flex items-center justify-center mb-6 sm:mb-8 mx-auto shadow-xl group-hover:rotate-12 transition-transform duration-700`}>
            {!isWallet ? (
               <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-500" />
            ) : (
               <Wallet className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-500" />
            )}
        </div>
        
        <div className="space-y-2 sm:space-y-4 mb-8 sm:mb-12 text-center">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
               <Zap className={`w-4 h-4 sm:w-5 h-5 ${!isWallet ? 'text-emerald-500' : 'text-indigo-500'}`} />
               <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase leading-none text-primary">
                 {isWallet ? "Settle " : "Ride "}
                 <span className={!isWallet ? "text-emerald-500" : "text-indigo-500"}>
                   {isWallet ? "Transaction" : "Completed"}
                 </span>
               </h2>
            </div>
            <p className="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-[0.3em] sm:tracking-[0.5em] max-w-[250px] sm:max-w-[300px] mx-auto leading-relaxed italic opacity-60">
               {isWallet ? "Digital wallet deduction processed successfully." : "Please facilitate cash payment to your driver."}
            </p>
        </div>

        {/* Payment Summary */}
        <div className="w-full bg-surface/50 border border-border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 mb-8 sm:mb-10 space-y-6 sm:space-y-8 relative overflow-hidden group/price">
           <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover/price:opacity-100 transition-opacity"></div>
           
           <div className="space-y-1 sm:space-y-2 relative z-10">
              <p className="text-[9px] sm:text-[11px] font-bold text-muted uppercase tracking-[0.2em] sm:tracking-[0.3em]">Final Payable Amount</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-muted mt-2">₹</span>
                <p className="text-5xl sm:text-7xl font-black italic tracking-tighter text-primary drop-shadow-sm">
                  {finalPrice}
                </p>
              </div>
           </div>
           
           <div className={`flex items-center justify-center gap-3 sm:gap-4 py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl border transition-colors ${
             isWallet ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
           }`}>
              {isWallet ? <Wallet className="w-4 h-4 sm:w-5 h-5" /> : <Banknote className="w-4 h-4 sm:w-5 h-5" />}
              <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em]">
                {isWallet ? "Digital Transfer Complete" : "Cash Payment Mode"}
              </p>
           </div>

           {isWallet && (
             <div className="flex flex-col items-center gap-4 sm:gap-6 py-2 animate-in fade-in duration-1000">
                <div className="p-4 bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-xl transform hover:scale-105 transition-transform">
                   <QRCode 
                     value={`ride_hive_pay_${ride.rideId}_${finalPrice}`} 
                     size={120}
                     level="H"
                   />
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>
                   <p className="text-[8px] sm:text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Transaction archived online</p>
                </div>
             </div>
           )}

           {!isWallet && (
             <div className="bg-emerald-500/5 p-4 sm:p-6 rounded-xl border border-emerald-500/10 space-y-1">
                <p className="text-[8px] sm:text-[9px] font-bold text-emerald-500 uppercase tracking-widest opacity-60">Protocol Instruction</p>
                <p className="text-xs font-bold text-primary italic">Confirm payment with driver before closing.</p>
             </div>
           )}
        </div>

        <button 
          onClick={onDone} 
          className={`w-full h-16 sm:h-24 rounded-[1.5rem] sm:rounded-[2.5rem] ${!isWallet ? 'bg-emerald-500 shadow-[0_16px_32px_rgba(16,185,129,0.2)]' : 'bg-indigo-500 shadow-[0_16px_32px_rgba(99,102,241,0.2)]'} text-white font-black uppercase italic text-sm sm:text-base tracking-[0.3em] sm:tracking-[0.5em] hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 sm:gap-6 group/btn relative overflow-hidden`}
        >
           <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
           <span className="relative z-10 flex items-center gap-3 sm:gap-4">
              Finish Journey
              <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover/btn:translate-x-2 transition-transform" />
           </span>
        </button>

        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-4 opacity-20 pointer-events-none">
           <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
           <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.5em] sm:tracking-[0.8em]">End of Mission Protocol</p>
        </div>
      </div>
    </div>
  );
}