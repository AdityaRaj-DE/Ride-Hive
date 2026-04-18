// components/driver/WalletCard.tsx
import React, { useState, type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { addFunds } from "../../store/slices/driverWalletSlice";
import { Wallet, Plus, Zap, Activity, Cpu, Sparkles, Fingerprint, TrendingUp } from 'lucide-react';

export default function WalletCard() {
  const dispatch = useDispatch<AppDispatch>();
  const { walletBalance } = useSelector(
    (state: RootState) => state.driverWallet
  );
  const [amount, setAmount] = useState<number>(0);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const handleAdd = () => {
    if (!amount) return;
    dispatch(addFunds(amount));
    setAmount(0);
  };

  return (
    <div className="premium-card p-12 glass-panel border border-white/10 shadow-[0_128px_256px_rgba(0,0,0,0.8)] backdrop-blur-3xl rounded-[4rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-1000">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000 rotate-12">
         <Wallet className="w-64 h-64 text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]" />
      </div>

      <header className="flex items-center justify-between gap-8 mb-12 relative z-10">
        <div className="flex items-center gap-6 group/title">
           <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover/title:rotate-12 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <TrendingUp className="w-8 h-8 shadow-[0_0_15px_rgba(16,185,129,1)]" />
           </div>
           <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase text-main leading-none">Liquidity <span className="text-emerald-500">Vault</span></h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30 mt-2 italic">Regional Asset Balance</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4 px-6 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500 backdrop-blur-3xl italic">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
           Sync Active
        </div>
      </header>

      <div className="space-y-12 relative z-10">
        <div className="space-y-4">
           <p className="text-8xl md:text-9xl font-black italic tracking-tighter text-main leading-none group-hover:text-emerald-500 transition-colors duration-1000">
             <span className="text-4xl text-emerald-500 align-top mt-4 inline-block mr-2">₹</span>
             {walletBalance || 0}
           </p>
           <p className="text-[12px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30 italic leading-relaxed max-w-sm">
             Verified liquidity used for regional subscription hashes and intra-fleet node charges.
           </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group/input">
            <input
              type="number"
              className="w-full bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 pl-12 text-2xl font-black italic tracking-tighter text-emerald-500 placeholder:opacity-5 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.04] transition-all shadow-inner"
              placeholder="0.00"
              value={amount || ""}
              onChange={handleAmountChange}
            />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
               <Zap className="w-6 h-6 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          
          <button
            onClick={handleAdd}
            disabled={!amount}
            className="px-16 h-24 rounded-[3rem] bg-emerald-500 text-white font-black uppercase italic text-sm tracking-[0.5em] shadow-[0_32px_64px_rgba(16,185,129,0.3)] hover:scale-[1.05] active:scale-95 transition-all duration-700 group/btn relative overflow-hidden shadow-2xl disabled:opacity-20 disabled:grayscale"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-1000"></div>
             <span className="relative z-10 flex items-center justify-center gap-6">
                Inject <Plus className="w-6 h-6 shadow-[0_0_15px_rgba(255,255,255,1)]" />
             </span>
          </button>
        </div>
      </div>

      <footer className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-12 opacity-10 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex items-center gap-4 grayscale group-hover:grayscale-0 transition-all cursor-help">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.5em] italic">Handshake: AES-256</p>
         </div>
         <div className="flex items-center gap-4 grayscale group-hover:grayscale-0 transition-all cursor-help">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <p className="text-[9px] font-black uppercase tracking-[0.5em] italic">Yield v9.4.S</p>
         </div>
         <div className="flex items-center gap-4 grayscale group-hover:grayscale-0 transition-all cursor-help">
            <Fingerprint className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
            <p className="text-[9px] font-black uppercase tracking-[0.5em] italic">Biometric Secure</p>
         </div>
      </footer>
      
      {/* Floating Corner Glow */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
    </div>
  );
}
