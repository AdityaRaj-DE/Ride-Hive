import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, Landmark, Sparkles, ShieldCheck, ArrowRight, Wallet, Activity, Globe, Zap, Search } from 'lucide-react';
import type { RootState } from '../store';

const WalletPage: React.FC = () => {
  const { token } = useSelector((s: RootState) => s.auth);
  const [balance, setBalance] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
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
        
        const mappedTxns = txnRes.data.map((t: any) => ({
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
    <div className="min-h-screen text-primary p-6 sm:p-10">
      <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4">
             <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20 shadow-sm backdrop-blur-md">
                   <Wallet className="w-6 h-6" />
                </div>
                <div className="px-4 py-2 rounded-full bg-surface border border-border text-accent text-[10px] font-bold uppercase tracking-widest">
                   Earnings Terminal
                </div>
             </div>
             <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
               Your <span className="text-accent">Wallet</span>
             </h1>
             <p className="text-secondary text-sm font-medium max-w-2xl leading-relaxed">
               Manage your daily earnings, view transaction history, and withdraw funds directly to your bank account.
             </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center text-secondary hover:text-accent hover:border-accent/30 transition-all active:scale-95">
                <Search className="w-6 h-6" />
             </button>
             <button className="btn-primary h-14 px-8 gap-3">
                <Plus className="w-5 h-5" />
                Withdraw Funds
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-8">
            <div className="glass-card p-8 md:p-12 border-accent/10 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
                  <Landmark className="w-64 h-64 text-accent" />
               </div>
               
               <div className="relative z-10 h-full flex flex-col justify-between min-h-[300px]">
                 <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                       <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                       <p className="font-bold uppercase tracking-widest text-[10px] text-accent">Available Balance</p>
                       <p className="font-bold text-[9px] uppercase tracking-wider text-muted opacity-60">Verified & Secured</p>
                    </div>
                 </div>
                 
                 <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                    <div className="space-y-4">
                       <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-primary leading-none">
                          ₹{balance.toLocaleString('en-IN')}<span className="text-3xl md:text-5xl opacity-20">.00</span>
                       </h2>
                       <div className="flex items-center gap-3 text-accent font-bold bg-accent/5 w-fit px-4 py-1.5 rounded-full border border-accent/10">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-[10px] uppercase tracking-widest">Real-time Balance</span>
                       </div>
                    </div>
                    
                    <button className="h-14 px-8 rounded-xl bg-surface border border-border text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-background transition-all flex items-center justify-center gap-3 active:scale-95">
                       <CreditCard className="w-5 h-5 text-accent" />
                       Payout Settings
                    </button>
                 </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 h-full">
            <div className="glass-card p-8 md:p-10 border-accent/10 shadow-xl h-full flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12">
                  <ShieldCheck className="w-48 h-48 text-accent" />
               </div>
               
               <div>
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Active Plan</p>
                  </div>
                  <h3 className="text-4xl font-bold text-primary mb-4 tracking-tight">
                    {subscription?.plan?.name || "No Plan"}
                  </h3>
                  <p className="text-sm text-secondary font-medium leading-relaxed opacity-60">
                    {subscription?.isActive 
                      ? `Your subscription is active until ${new Date(subscription.expiresAt).toLocaleDateString()}.`
                      : "You do not have an active subscription plan."}
                  </p>
                  {subscription?.isActive && (
                    <div className="mt-8 flex items-center gap-3 px-4 py-2 rounded-xl bg-accent/5 border border-accent/10 w-fit">
                       <Zap className="w-4 h-4 text-accent fill-current" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Auto-renew active</span>
                    </div>
                  )}
               </div>

               <button className="w-full mt-12 h-14 rounded-xl bg-accent text-white font-bold uppercase tracking-widest text-[10px] hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-3">
                  <span>Manage Subscription</span>
                  <Activity className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 px-4">
             <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-primary uppercase">History</h2>
                <div className="px-4 py-1 rounded-full bg-accent/5 text-accent text-[9px] font-bold uppercase tracking-widest border border-accent/10">
                   Real-time Sync
                </div>
             </div>
             <button className="text-accent font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all group">
                Download Statement <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
             </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <div key={t.id} className="glass-card p-4 sm:p-6 flex items-center justify-between group hover:border-accent/40 transition-all relative overflow-hidden">
                  <div className="flex items-center gap-6 relative z-10">
                     <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border shadow-sm transition-all ${
                       t.type === 'credit' 
                       ? 'bg-accent/5 text-accent border-accent/20' 
                       : 'bg-rose-500/5 text-rose-500 border-rose-500/20'
                     }`}>
                       {t.type === 'credit' ? <ArrowDownLeft className="w-6 h-6 sm:w-8 sm:h-8" /> : <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8" />}
                     </div>
                     <div className="min-w-0 space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-accent mb-1 opacity-60">{t.method}</p>
                        <h4 className="text-lg font-bold tracking-tight text-primary truncate leading-tight uppercase">{t.title}</h4>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-wider">{t.date}</p>
                     </div>
                  </div>
                  <div className="text-right relative z-10">
                     <p className={`text-2xl sm:text-3xl font-bold tracking-tighter leading-none ${t.type === 'credit' ? 'text-accent' : 'text-rose-500'}`}>
                       {t.type === 'credit' ? '+' : '−'} {t.amount}<span className="text-sm sm:text-lg opacity-40">.00</span>
                     </p>
                     <div className="flex items-center justify-end gap-2 mt-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'credit' ? 'bg-accent' : 'bg-rose-500'}`}></div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">{t.status}</p>
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className=" glass-card p-12 text-center opacity-40">
                <p className="text-sm font-bold uppercase tracking-widest">No transactions found</p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-32 pt-12 border-t border-border opacity-30 flex flex-col items-center gap-8">
           <div className="flex items-center justify-center gap-8 sm:gap-16">
              <div className="flex items-center gap-3">
                 <Globe className="w-4 h-4 text-accent" />
                 <p className="text-[9px] font-bold uppercase tracking-widest">Global Ledger</p>
              </div>
              <div className="flex items-center gap-3">
                 <Zap className="w-4 h-4 text-accent" />
                 <p className="text-[9px] font-bold uppercase tracking-widest">Instant Payouts</p>
              </div>
           </div>
           <p className="text-[9px] font-bold tracking-widest uppercase">Hive OS • Secure Financial Node</p>
        </footer>
      </div>
    </div>
  );
};

export default WalletPage;

