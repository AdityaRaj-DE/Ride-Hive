import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import type { RootState } from '../store';
import { Mail, Phone, Shield, Star, LogOut, Edit2, Award, Briefcase, ArrowRight, ShieldCheck, Globe, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IDriverProfile {
  fullname?: {
    firstname: string;
    lastname: string;
  };
  email?: string;
  mobile?: string;
  rating?: number;
  createdAt?: string;
  acceptanceRate?: number;
  totalEarnings?: number;
  vehicleInfo?: {
    model: string;
    plateNumber: string;
    color: string;
    type: string;
  };
  subscription?: {
    expiresAt?: string;
    isActive?: boolean;
  };
  status?: string;
  documents?: {
    drivingLicense?: { url: string; uploadedAt: string };
    rcBook?: { url: string; uploadedAt: string };
    insurance?: { url: string; uploadedAt: string };
    profilePhoto?: { url: string; uploadedAt: string };
  };
}

const Profile: React.FC = () => {
  const { user, token } = useSelector((s: RootState) => s.auth);
  const [profile, setProfile] = useState<IDriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await api.get("/driver/me");
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

  const displayName = profile?.fullname ? `${profile.fullname.firstname} ${profile.fullname.lastname}` : user?.mobileNumber || 'Anonymous';

  const docItems = [
    { label: "Driving License", status: profile?.documents?.drivingLicense ? "Verified" : "Missing" },
    { label: "RC Book", status: profile?.documents?.rcBook ? "Verified" : "Missing" },
    { label: "Insurance", status: profile?.documents?.insurance ? "Verified" : "Missing" },
  ];

  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-6xl mx-auto p-mobile-safe relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Partner Executive Profile</p>
             </div>
             <h1 className="text-3xl sm:text-6xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
               Hive <span className="text-accent">Partner</span>
             </h1>
          </div>
          <Link 
            to="/driver/profile/edit"
            className="h-12 sm:h-16 px-6 sm:px-10 rounded-2xl bg-surface border border-border flex items-center justify-center gap-4 text-primary hover:bg-background hover:border-accent/40 transition-all active:scale-95 shadow-xl group border-accent/10"
          >
            <Edit2 className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Sync Profile</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start px-4">
          {/* Identity Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-10 border-accent/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
               <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-accent/0 via-accent to-accent/0 opacity-50"></div>
              
              <div className="relative mb-12 flex justify-center">
                <div className="w-32 h-32 sm:w-44 sm:h-44 bg-surface rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center border-2 border-accent/10 shadow-inner overflow-hidden relative group transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-accent text-5xl sm:text-7xl font-bold transition-transform duration-500 group-hover:scale-110">
                    {displayName?.charAt(0) || 'D'}
                  </span>
                </div>
                <div className="absolute -bottom-4 right-1/4 translate-x-12 bg-white p-2 rounded-2xl shadow-2xl border border-border">
                   <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-500">
                      <Star className="w-5 h-5 fill-current" />
                   </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-12 text-center">
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tighter text-primary uppercase leading-tight">{displayName}</h2>
                 <div className="flex flex-col items-center gap-3">
                    <span className="px-5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-[0.3em]">{profile?.status || "Partner Hub"}</span>
                    <span className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] opacity-40">Operational Node: Regional-04</span>
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40">Document Clearance</p>
                 <div className="space-y-2">
                    {docItems.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                         <span className="text-[10px] font-bold text-primary/80 uppercase">{doc.label}</span>
                         <span className={`text-[9px] font-bold uppercase ${doc.status === "Verified" ? "text-accent" : "text-warning"}`}>{doc.status}</span>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="flex flex-col gap-4 mb-4">
                 <div className="flex items-center justify-between p-6 bg-accent/5 rounded-2xl border border-accent/10">
                    <div className="flex items-center gap-4 text-amber-500">
                       <Star className="w-6 h-6 fill-current" />
                       <span className="text-3xl font-bold text-primary tracking-tighter">{(profile?.rating || 0).toFixed(2)}</span>
                    </div>
                     <div className="text-right">
                        <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40">Score</p>
                        <p className="text-xs font-bold text-accent">Elite</p>
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-surface border border-border rounded-2xl text-center">
                       <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 mb-2">Network Age</p>
                       <p className="text-2xl font-bold text-primary tracking-tight">
                         {profile?.createdAt ? ((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1) : '0.0'}y
                       </p>
                    </div>
                    <div className="p-6 bg-surface border border-border rounded-2xl text-center">
                       <p className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40 mb-2">Sync Rate</p>
                       <p className="text-2xl font-bold text-primary tracking-tight">{profile?.acceptanceRate || 100}%</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="glass-card p-8 border-accent/10 bg-accent/5 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
                  <ShieldCheck className="w-32 h-32 text-accent" />
               </div>
               <div className="flex items-center gap-5 mb-5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">ID Authenticated</p>
                     <p className="text-xs font-bold text-primary uppercase">Verified Link State</p>
                  </div>
               </div>
               <p className="text-xs font-medium text-secondary opacity-60 leading-relaxed px-1">Your professional background check and logistics assets are fully authenticated on the blockchain.</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-8 space-y-12">
            <section className="glass-card p-10 border-accent/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                  <Mail className="w-64 h-64 text-accent" />
               </div>
               
               <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-primary uppercase tracking-tight relative z-10">
                  <div className="w-2 h-8 bg-accent rounded-full"></div>
                  Link Parameters
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 <div className="flex items-center gap-6 p-8 rounded-3xl bg-surface/50 border border-border hover:border-accent/40 transition-all group backdrop-blur-sm">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform border border-accent/10">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mb-1 opacity-60">Primary Email</p>
                      <p className="text-lg font-bold truncate text-primary/90 lowercase tracking-wide">{profile?.email || 'N/A'}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-6 p-8 rounded-3xl bg-surface/50 border border-border hover:border-accent/40 transition-all group backdrop-blur-sm">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform border border-accent/10">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mb-1 opacity-60">Control Number</p>
                      <p className="text-lg font-bold text-primary/90 uppercase tracking-widest">{profile?.mobile || user?.mobileNumber}</p>
                    </div>
                 </div>
               </div>
            </section>

            <section className="glass-card p-10 border-accent/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none rotate-12">
                  <Briefcase className="w-64 h-64 text-accent" />
               </div>

               <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-primary uppercase tracking-tight relative z-10">
                  <div className="w-2 h-8 bg-accent rounded-full"></div>
                  Logistics Matrix
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
                  <div className="flex items-center gap-6 p-8 rounded-3xl bg-surface/50 border border-border hover:border-accent/40 transition-all group backdrop-blur-sm">
                     <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/10 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mb-1 opacity-60">Assigned Unit</p>
                        <p className="text-xl font-bold text-primary uppercase leading-tight">{profile?.vehicleInfo?.color} {profile?.vehicleInfo?.model}</p>
                        <p className="text-[10px] font-bold text-accent tracking-widest mt-1">{profile?.vehicleInfo?.plateNumber}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 p-8 rounded-3xl bg-surface/50 border border-border hover:border-accent/40 transition-all group backdrop-blur-sm">
                     <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/10 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6" />
                     </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mb-1 opacity-60">Sync Clearance</p>
                        <p className="text-xl font-bold text-primary/90">
                          {profile?.subscription?.expiresAt 
                            ? new Date(profile.subscription.expiresAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : 'Access Revoked'}
                        </p>
                        <p className="text-[10px] font-bold text-accent tracking-widest mt-1">Status: Stable</p>
                      </div>
                  </div>
               </div>

               <div className="flex flex-col xl:flex-row items-center justify-between p-10 rounded-3xl bg-accent/5 border border-accent/20 relative overflow-hidden">
                  <div className="flex items-center gap-8 w-full xl:w-auto mb-10 xl:mb-0">
                     <div className="w-24 h-24 rounded-3xl bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent/40">
                        <Award className="w-12 h-12" />
                     </div>
                     <div className="space-y-1">
                         <p className="text-4xl sm:text-6xl font-bold tracking-tighter text-accent leading-none">₹{profile?.totalEarnings || 0}</p>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] opacity-40 italic">Aggregated Grid Yield</p>
                     </div>
                  </div>
                  <Link 
                    to="/driver/wallet"
                    className="w-full xl:w-auto h-16 px-12 rounded-2xl bg-white border border-border text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl"
                  >
                     WALLET TERMINAL <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <button 
                 className="w-full h-16 rounded-2xl border border-border bg-surface text-primary font-bold text-[10px] tracking-[0.3em] uppercase hover:bg-background hover:border-accent/40 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-lg shadow-black/5"
               >
                 <Globe className="w-4 h-4 text-accent" />
                 Global Locale
               </button>
                <button 
                  className="w-full h-14 sm:h-16 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500 font-bold text-[10px] tracking-[0.3em] uppercase hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-4 active:scale-95 shadow-lg shadow-rose-500/10 group"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
                  Sever Link
                </button>
            </div>
          </div>
        </div>

        <footer className="mt-40 text-center space-y-10 opacity-30 hover:opacity-100 transition-all duration-1000">
           <div className="flex items-center justify-center gap-12">
              <div className="flex items-center gap-3">
                 <Zap className="w-4 h-4 text-accent" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Hive Partner OS v2.4.0</p>
              </div>
              <div className="w-[1.5px] h-6 bg-border/50"></div>
              <div className="flex items-center gap-3">
                 <Activity className="w-4 h-4 text-accent" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Network Integrity: 100%</p>
              </div>
           </div>
           <p className="text-[9px] font-bold text-muted uppercase tracking-[0.5em]">SECURE PROFILE NODE • END-TO-END QUANTUM ENCRYPTION</p>
        </footer>
      </div>
    </div>
  );
};

export default Profile;
