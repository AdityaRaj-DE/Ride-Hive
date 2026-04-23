import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, Landmark, Sparkles, ShieldCheck, ArrowRight, Wallet, Activity, Globe, Zap, Search, Calendar } from 'lucide-react';
import type { RootState } from '../store';

interface ISubscription {
  plan?: {
    name: string;
  };
  isActive: boolean;
  expiresAt: string;
}

interface ITransaction {
  id: string;
  type: 'credit' | 'debit' | string;
  amount: number;
  title: string;
  date: string;
  method: string;
  status: string;
}

interface RawTransaction {
  _id: string;
  amount: number;
  rideId: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
}

const WalletPage: React.FC = () => {
  const { token } = useSelector((s: RootState) => s.auth);
  const [balance, setBalance] = useState(0);
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // 1. Fetch balance & driver profile (to get driver _id)
        const walletRes = await axios.get("http://localhost:3000/driver/wallet", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBalance(walletRes.data.walletBalance || 0);
        setSubscription(walletRes.data.subscription);

        // 2. Fetch driver profile to get the internal driver._id for payment service
        const driverRes = await axios.get("http://localhost:3000/driver/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const driverId = driverRes.data._id;

        // 3. Fetch transactions from payment service
        const txnRes = await axios.get(`http://localhost:3000/payment/driver/${driverId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const mappedTxns = txnRes.data.map((t: RawTransaction) => ({
          id: t._id,
          type: 'credit', // In this system, payments to drivers are credits
          amount: `₹${t.amount}`,
          title: `Trip #${t.rideId.slice(-4).toUpperCase()}`,
          date: new Date(t.createdAt).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: t.status === 'SUCCESS' ? 'Completed' : t.status,
          method: t.paymentMethod === 'WALLET' ? 'In-app Wallet' : t.paymentMethod
        }));

        setTransactions(mappedTxns);
      } catch (err) {
        console.error("Failed to fetch wallet data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchWalletData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-6xl mx-auto px-6 pt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-20 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
          <div className="space-y-4">
             <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20 shadow-xl backdrop-blur-xl">
                   <Wallet className="w-7 h-7" />
                </div>
                <div className="px-5 py-2 rounded-full bg-surface border border-border text-accent text-[10px] font-bold uppercase tracking-[0.3em]">
                   Grid Yield Terminal
                </div>
             </div>
             <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
               Your <span className="text-accent">Earnings</span>
             </h1>
             <p className="text-secondary text-base font-medium max-w-2xl leading-relaxed opacity-70 italic">
               Aggregate and manage your traversal rewards across the regional network nodes.
             </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-secondary hover:text-accent hover:border-accent/30 transition-all active:scale-95 shadow-lg group">
                <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
             </button>
             <button className="btn-primary h-16 px-10 gap-4 text-xs tracking-[0.2em]">
                <Plus className="w-5 h-5 leading-none" />
                INITIATE PAYOUT
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-8">
            <div className="glass-card p-10 md:p-16 border-accent/10 shadow-2xl relative overflow-hidden group backdrop-blur-2xl">
               <div className="absolute top-0 right-0 p-16 opacity-[0.04] pointer-events-none rotate-12 transition-transform duration-1000 group-hover:rotate-0">
                  <Landmark className="w-80 h-80 text-accent" />
               </div>
               
               <div className="relative z-10 h-full flex flex-col justify-between min-h-[350px]">
                 <div className="flex items-center gap-5 mb-16">
                    <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center border border-white/10 shadow-2xl shadow-accent/40">
                       <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                       <p className="font-bold uppercase tracking-[0.3em] text-[10px] text-accent">Secured Grid Balance</p>
                       <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-muted opacity-40">Blockchain Verified</p>
                    </div>
                 </div>
                 
                 <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                    <div className="space-y-6">
                       <h2 className="text-6xl md:text-9xl font-bold tracking-tighter text-primary leading-none group-hover:scale-[1.02] transition-transform duration-700">
                          ₹{balance.toLocaleString('en-IN')}<span className="text-3xl md:text-6xl opacity-10">.00</span>
                       </h2>
                       <div className="flex items-center gap-3 text-accent font-bold bg-accent/5 w-fit px-5 py-2 rounded-full border border-accent/10">
                          <TrendingUp className="w-4 h-4 animate-pulse" />
                          <span className="text-[10px] uppercase tracking-[0.3em] leading-none">Net Yield Delta: +12.4%</span>
                       </div>
                    </div>
                    
                    <button className="h-14 px-8 rounded-xl bg-white border border-border text-primary font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl">
                       <CreditCard className="w-5 h-5 opacity-70" />
                       Node Linkage
                    </button>
                 </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 h-full">
            <div className="glass-card p-10 md:p-12 border-accent/10 shadow-2xl h-full flex flex-col justify-between relative overflow-hidden group backdrop-blur-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-[25deg] transition-transform duration-1000 group-hover:rotate-0">
                  <ShieldCheck className="w-56 h-56 text-accent" />
               </div>
               
               <div>
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse"></div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent leading-none">Access Level</p>
                  </div>
                  <h3 className="text-5xl font-bold text-primary mb-5 tracking-tighter uppercase leading-tight">
                    {subscription?.plan?.name || "Tier: Default"}
                  </h3>
                  <p className="text-sm text-secondary font-medium leading-relaxed opacity-60 italic">
                    {subscription?.isActive 
                      ? `Your clearance remains valid until the next synchronization cycle on ${new Date(subscription.expiresAt).toLocaleDateString()}.`
                      : "Your premium clearance has expired. Immediate renewal is suggested for optimal node interception."}
                  </p>
                  {subscription?.isActive && (
                    <div className="mt-10 flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-accent/5 border border-accent/10 w-fit">
                       <Zap className="w-4 h-4 text-accent fill-current animate-pulse" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Auto-Link Active</span>
                    </div>
                  )}
               </div>

               <button className="w-full mt-16 h-14 rounded-xl bg-accent text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-accent/90 transition-all shadow-2xl shadow-accent/40 flex items-center justify-center gap-4 active:scale-95">
                  <span>OVERRIDE PLAN</span>
                  <Activity className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        <div className="mb-32">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12 px-6 relative">
             <div className="flex items-center gap-5">
                <h2 className="text-4xl font-bold tracking-tighter text-primary uppercase">Sync Log</h2>
                <div className="px-5 py-1.5 rounded-full bg-accent text-white text-[9px] font-bold uppercase tracking-[0.3em] shadow-lg shadow-accent/20">
                   Real-time
                </div>
             </div>
             <button className="text-accent font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:gap-6 transition-all group">
                EXPORT ARCHIVE <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform" />
             </button>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4">
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <div key={t.id} className="glass-card p-6 sm:p-8 flex items-center justify-between group hover:border-accent/30 transition-all relative overflow-hidden backdrop-blur-xl">
                  <div className="flex items-center gap-8 relative z-10">
                     <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border shadow-2xl transition-all ${
                       t.type === 'credit' 
                       ? 'bg-accent/5 text-accent border-accent/20' 
                       : 'bg-rose-500/5 text-rose-500 border-rose-500/20'
                     }`}>
                       {t.type === 'credit' ? <ArrowDownLeft className="w-8 h-8 sm:w-10 sm:h-10" /> : <ArrowUpRight className="w-8 h-8 sm:w-10 sm:h-10" />}
                     </div>
                     <div className="min-w-0 space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent mb-1 opacity-50">{t.method}</p>
                        <h4 className="text-xl font-bold tracking-tight text-primary truncate leading-none uppercase">{t.title}</h4>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                           <Calendar className="w-3 h-3 opacity-40" />
                           {t.date}
                        </p>
                     </div>
                  </div>
                  <div className="text-right relative z-10">
                     <p className={`text-3xl sm:text-5xl font-bold tracking-tighter leading-none ${t.type === 'credit' ? 'text-accent' : 'text-rose-500'}`}>
                       {t.type === 'credit' ? '+' : '−'} {t.amount}<span className="text-sm sm:text-2xl opacity-10">.00</span>
                     </p>
                     <div className="flex items-center justify-end gap-3 mt-4">
                        <div className={`w-2 h-2 rounded-full ${t.type === 'credit' ? 'bg-accent shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'}`}></div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted opacity-40">{t.status}</p>
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-24 text-center border-dashed border-border/50 text-muted/30">
                <p className="text-xs font-bold uppercase tracking-[0.5em]">Global ledger is currently clear</p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-40 pt-16 border-t border-border opacity-30 flex flex-col items-center gap-12 hover:opacity-100 transition-opacity duration-1000">
           <div className="flex items-center justify-center gap-12 sm:gap-24">
              <div className="flex items-center gap-4">
                 <Globe className="w-5 h-5 text-accent" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Decentralized Ledger</p>
              </div>
              <div className="flex items-center gap-4">
                 <Zap className="w-5 h-5 text-accent" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Direct Settlement</p>
              </div>
           </div>
           <p className="text-[9px] font-bold tracking-[0.6em] uppercase text-muted">HIVE OS • SECURE FINANCIAL NODE DELTA-04</p>
        </footer>
      </div>
    </div>
  );
};

export default WalletPage;

