import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import type { RootState } from '../store';
import { Mail, Phone, Shield, Star, LogOut, Edit2, Award, Briefcase, ArrowRight, ShieldCheck, Globe, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, token } = useSelector((s: RootState) => s.auth);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/driver/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch driver profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfileData();
  }, [token]);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayName = profile?.fullname ? `${profile.fullname.firstname} ${profile.fullname.lastname}` : (user as any).name;


  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-20 flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Account Management</p>
             </div>
             <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
               Driver <span className="text-accent">Profile</span>
             </h1>
          </div>
          
          <Link 
            to="/driver/profile/edit"
            className="h-16 w-16 bg-surface border border-border flex items-center justify-center rounded-2xl text-accent hover:bg-background hover:border-accent/40 transition-all active:scale-95 shadow-sm"
          >
             <Edit2 className="w-6 h-6" />
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Identity Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-10 border-accent/10 shadow-xl relative overflow-hidden text-center backdrop-blur-xl">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-accent"></div>
              
              <div className="relative mb-10 inline-block">
                <div className="w-48 h-48 bg-accent/5 rounded-[3rem] flex items-center justify-center border-2 border-accent/10 shadow-inner overflow-hidden relative group">
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-accent text-8xl font-bold uppercase tracking-tighter relative z-10">
                    {displayName?.charAt(0) || 'D'}
                  </span>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-surface p-2.5 rounded-2xl border border-border shadow-md">
                   <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-500">
                      <Star className="w-6 h-6 fill-current" />
                   </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-10">
                 <h2 className="text-4xl font-bold tracking-tight text-primary uppercase leading-none">{displayName}</h2>
                 <div className="flex flex-col items-center gap-2">
                    <span className="px-4 py-1 rounded-full bg-accent/5 border border-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest">Premium Partner</span>
                    <span className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40">Regional Hub: Sector 4</span>
                 </div>
              </div>
              
              <div className="flex items-center justify-center gap-6 text-amber-500 mb-10 py-6 px-8 bg-accent/5 rounded-2xl border border-accent/10">
                 <Star className="w-6 h-6 fill-current" />
                 <span className="text-4xl font-bold text-primary tracking-tighter">{(profile?.rating || 0).toFixed(2)}</span>
                 <div className="w-px h-8 bg-border"></div>
                 <span className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40">{profile?.totalRides || 0} Trips</span>
              </div>

              <div className="pt-8 border-t border-border grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1 opacity-40">Active Years</p>
                    <p className="text-2xl font-bold text-primary tracking-tight">
                      {profile?.createdAt ? ((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1) : '0.0'}
                    </p>
                 </div>
                 <div className="text-center">
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1 opacity-40">Acceptance</p>
                    <p className="text-2xl font-bold text-primary tracking-tight">{profile?.acceptanceRate || 100}%</p>
                 </div>
              </div>
            </div>

            <div className="glass-card p-8 border-accent/10 bg-accent/5 rounded-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12">
                  <ShieldCheck className="w-24 h-24 text-accent" />
               </div>
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Identity Verified</p>
               </div>
               <p className="text-xs font-medium text-secondary opacity-60 leading-relaxed px-1">Your professional background check and vehicle documents are fully authenticated.</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-8 space-y-12">
            <section className="glass-card p-10 border-accent/10 shadow-xl relative overflow-hidden backdrop-blur-xl">
               <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-primary uppercase">
                  <div className="w-1.5 h-8 bg-accent rounded-full"></div>
                  Account Information
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all group">
                    <div className="w-14 h-14 rounded-xl bg-accent/5 flex items-center justify-center text-accent group-hover:scale-105 transition-transform border border-border">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 mb-1">Email Address</p>
                      <p className="text-lg font-semibold truncate text-primary/80 lowercase">{profile?.email || (user as any).email || 'N/A'}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all group">
                    <div className="w-14 h-14 rounded-xl bg-accent/5 flex items-center justify-center text-accent group-hover:scale-105 transition-transform border border-border">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 mb-1">Mobile Number</p>
                      <p className="text-lg font-semibold text-primary/80 uppercase tracking-widest">{profile?.mobile || (user as any).mobile}</p>
                    </div>
                 </div>
               </div>
            </section>

            <section className="glass-card p-10 border-accent/10 shadow-xl relative overflow-hidden backdrop-blur-xl">
               <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-primary uppercase">
                  <div className="w-1.5 h-8 bg-accent rounded-full"></div>
                  Vehicle Asset
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all group">
                     <div className="w-14 h-14 bg-accent/5 rounded-xl flex items-center justify-center text-accent border border-border group-hover:scale-105 transition-transform">
                        <Briefcase className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 mb-1">Registered Unit</p>
                        <p className="text-xl font-bold text-primary/80 uppercase">{profile?.vehicleInfo?.color} {profile?.vehicleInfo?.model}</p>
                        <p className="text-[10px] font-bold text-accent">{profile?.vehicleInfo?.plateNumber}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all group">
                     <div className="w-14 h-14 bg-accent/5 rounded-xl flex items-center justify-center text-accent border border-border group-hover:scale-105 transition-transform">
                        <Shield className="w-6 h-6" />
                     </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 mb-1">Insurance Expiry</p>
                        <p className="text-xl font-bold text-primary/80">
                          {profile?.subscription?.expiresAt 
                            ? new Date(profile.subscription.expiresAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : 'Not Active'}
                        </p>
                      </div>
                  </div>
               </div>

               <div className="flex flex-col xl:flex-row items-center justify-between p-10 rounded-2xl bg-accent/5 border border-accent/10 relative overflow-hidden">
                  <div className="flex items-center gap-8 w-full xl:w-auto mb-8 xl:mb-0">
                     <div className="w-24 h-24 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                        <Award className="w-10 h-10" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-5xl font-bold tracking-tighter text-accent leading-none">₹{profile?.totalEarnings || 0}</p>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 italic">Total Lifetime Earnings</p>
                     </div>
                  </div>
                  <Link 
                    to="/driver/wallet"
                    className="w-full xl:w-auto h-14 px-10 rounded-xl bg-surface border border-border text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center justify-center gap-4 active:scale-95"
                  >
                     Wallet Terminal <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <button 
                className="w-full h-16 rounded-xl border border-border bg-surface text-primary font-bold text-[10px] tracking-widest uppercase hover:bg-background hover:border-accent/40 transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                <Globe className="w-4 h-4 text-accent" />
                Regional Settings
              </button>
              <button 
                className="w-full h-16 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 font-bold text-[10px] tracking-widest uppercase hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Partner
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-32 text-center space-y-8 opacity-20 hover:opacity-100 transition-all duration-700">
           <div className="flex items-center justify-center gap-4">
              <Zap className="w-4 h-4 text-accent" />
              <p className="text-[9px] font-bold uppercase tracking-widest">Hive Partner OS v2.4.0</p>
              <Activity className="w-4 h-4 text-accent" />
           </div>
           <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Operational Network Status: Stable • Hub Latency: 12ms</p>
        </footer>
      </div>
    </div>
  );
};

export default Profile;
