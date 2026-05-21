import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store';
import { Mail, Phone, Calendar, Edit2, LogOut, ShieldCheck, Award, Star, ArrowRight, User, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s: RootState) => s.auth);
  const [profile, setProfile] = useState<any>(null);
  const [rideCount, setRideCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
        deviceId: "web"
      });
    } catch (e) {
      console.error("Logout API failed", e);
    }
    
    // Explicitly clear local storage here
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    
    // Clear redux state
    dispatch(logout());
    
    // Navigate away
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.allSettled([
          api.get("/rider/profile"),
          api.get("/ride/history")
        ]);
        
        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data.rider);
        } else {
          console.error("Failed to fetch profile data:", profileRes.reason);
        }

        if (historyRes.status === 'fulfilled') {
          setRideCount(historyRes.value.data.filter((r: any) => r.status === 'COMPLETED').length);
        } else {
          console.error("Failed to fetch history data:", historyRes.reason);
        }
      } catch (err) {
        console.error("Failed to fetch profile/history:", err);
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

  const displayName = profile?.name ? `${profile.name.first} ${profile.name.last}` : 'Rider';


  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-16">
          <div className="space-y-2 sm:space-y-4">
             <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-accent">Account Settings</p>
             </div>
             <h1 className="text-2xl sm:text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
                Your <span className="text-accent">Profile</span>
             </h1>
          </div>
          <Link 
            to="/profile/edit"
            className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-surface border border-border flex items-center justify-center gap-2 sm:gap-3 text-primary hover:bg-background transition-all active:scale-95 shadow-sm group w-fit sm:w-auto"
          >
            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Edit</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* User Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 sm:p-10 border-accent/10 shadow-xl relative overflow-hidden text-center">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-32 sm:h-32 bg-surface rounded-[1.2rem] sm:rounded-[2.5rem] mx-auto flex items-center justify-center border border-border shadow-inner transition-all hover:scale-105 overflow-hidden group">
                   <span className="text-accent text-2xl sm:text-5xl font-bold transition-transform group-hover:scale-110">
                     {displayName?.charAt(0) || 'U'}
                   </span>
                </div>
                <div className="absolute -bottom-1 right-1/4 translate-x-1/2 bg-white p-1 rounded-lg sm:p-1.5 sm:rounded-xl shadow-lg border border-border">
                   <div className="bg-accent/10 text-accent p-1.5 sm:p-2 rounded-lg">
                      <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                   </div>
                </div>
              </div>
              
              <div className="space-y-1 mb-6 sm:mb-8">
                 <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-primary uppercase">{displayName}</h2>
                 <p className="text-[8px] sm:text-[10px] font-bold text-accent uppercase tracking-widest">Member Since {new Date(profile?.createdAt || (user as any).createdAt || Date.now()).getFullYear()}</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-accent mb-6 sm:mb-8 bg-accent/5 py-2 sm:py-3 rounded-2xl border border-accent/10 mx-2 sm:mx-4">
                 {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />)}
                 <span className="text-[10px] sm:text-xs font-bold ml-1 text-primary">5.0 Rating</span>
              </div>

              <div className="pt-6 sm:pt-8 border-t border-border space-y-1 opacity-60">
                 <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Account Created</p>
                 <p className="text-xs sm:text-sm font-semibold">{new Date(profile?.createdAt || (user as any).createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="glass-card p-4 sm:p-6 border-accent/10 bg-accent/5 flex flex-col gap-3 sm:gap-4 text-center sm:text-left">
               <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                     <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                     <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-accent">Elite Status</p>
                     <p className="text-[10px] sm:text-xs font-semibold text-primary uppercase">Loyalty Member</p>
                  </div>
               </div>
               <p className="text-[10px] sm:text-xs font-medium text-secondary leading-relaxed opacity-60 italic">You qualify for priority booking.</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            <section className="glass-card p-6 sm:p-10 border-accent/10 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-[0.02] pointer-events-none rotate-12">
                  <User className="w-32 h-32 sm:w-48 sm:h-48 text-accent" />
               </div>
               
               <h3 className="text-lg sm:text-xl font-bold tracking-tight text-primary uppercase mb-6 sm:mb-10 flex items-center gap-3">
                  <div className="w-1 h-5 sm:w-1.5 sm:h-6 bg-accent rounded-full"></div>
                  Contact Info
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
                 <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border group hover:border-accent/30 transition-all">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[9px] font-bold text-muted uppercase tracking-widest mb-0.5">Email</p>
                      <p className="text-sm sm:text-base font-semibold text-primary truncate leading-none">{profile?.email || (user as any).email || 'Not specified'}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border group hover:border-accent/30 transition-all">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[9px] font-bold text-muted uppercase tracking-widest mb-0.5">Mobile</p>
                      <p className="text-sm sm:text-base font-semibold text-primary truncate leading-none">{profile?.mobile || user?.mobileNumber || 'Not specified'}</p>
                    </div>
                 </div>
               </div>
            </section>

            <section className="glass-card p-6 sm:p-10 border-accent/10 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-[0.02] pointer-events-none rotate-12">
                  <Activity className="w-32 h-32 sm:w-48 sm:h-48 text-accent" />
               </div>
               
               <h3 className="text-lg sm:text-xl font-bold tracking-tight text-primary uppercase mb-6 sm:mb-10 flex items-center gap-3">
                  <div className="w-1 h-5 sm:w-1.5 sm:h-6 bg-accent rounded-full"></div>
                  Statistics
               </h3>
               
               <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 rounded-2xl bg-accent/5 border border-accent/10 gap-6 sm:gap-8">
                  <div className="flex items-center gap-4 sm:gap-6">
                     <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white border border-border flex items-center justify-center text-accent shadow-sm">
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                     </div>
                     <div>
                        <p className="text-3xl sm:text-5xl font-bold tracking-tighter text-primary leading-none">{rideCount}</p>
                        <p className="text-[8px] sm:text-[10px] font-bold text-accent uppercase tracking-widest mt-1 sm:mt-2 text-center sm:text-left">Rides Done</p>
                     </div>
                  </div>
                  <Link 
                    to="/history"
                    className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-accent text-white font-bold uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center justify-center gap-2 sm:gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20"
                  >
                     <span>History</span>
                     <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
               <button 
                 onClick={handleLogout}
                 className="h-12 sm:h-14 flex-1 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 font-bold uppercase tracking-widest text-[8px] sm:text-[10px] hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95 group"
               >
                 <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                 Sign Out
               </button>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 sm:mt-24 pt-8 sm:pt-12 border-t border-border opacity-20 flex flex-col items-center gap-4 pb-12">
         <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-muted text-center px-4">Hive Mobility • Secure Profile Node</p>
      </footer>
    </div>
  );
};

export default Profile;
