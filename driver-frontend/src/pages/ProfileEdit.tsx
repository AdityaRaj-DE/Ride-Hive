import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { User, Mail, Phone, ArrowLeft, Check, Camera, ShieldCheck, Activity, Zap, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((s: RootState) => s.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    vehicleModel: '',
    plateNumber: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/driver/me");
        if (data) {
          setFormData({
            firstName: data.fullname?.firstname || '',
            lastName: data.fullname?.lastname || '',
            email: (user as any)?.email || '', // Email comes from auth state
            vehicleModel: data.vehicleInfo?.model || '',
            plateNumber: data.vehicleInfo?.plateNumber || '',
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile for editing:", err);
      }
    };
    if (token) fetchProfile();
  }, [token, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/driver/me", {
        fullname: { firstname: formData.firstName, lastname: formData.lastName },
        vehicleInfo: { model: formData.vehicleModel, plateNumber: formData.plateNumber }
      });
      navigate('/driver/profile');
    } catch (err) {
      console.error("Failed to update driver profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-5xl mx-auto p-mobile-safe relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-16 flex items-center gap-8">
          <button 
            onClick={() => navigate('/driver/profile')}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-surface border border-border flex items-center justify-center text-primary hover:bg-background hover:border-accent/40 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Security Verified</p>
            </div>
             <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-primary leading-tight uppercase">
                Edit <span className="text-accent">Profile</span>
             </h1>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           {/* Avatar Section */}
           <div className="lg:col-span-4 flex flex-col items-center gap-10">
               <div className="relative group">
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-accent/5 rounded-[2.5rem] sm:rounded-[3.5rem] flex items-center justify-center border-2 border-accent/10 shadow-inner overflow-hidden relative backdrop-blur-xl">
                   <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <span className="text-accent text-7xl sm:text-9xl font-bold uppercase tracking-tighter relative z-10">
                     {(formData.firstName.charAt(0)) || 'D'}
                   </span>
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm cursor-pointer z-20">
                      <div className="flex flex-col items-center gap-3 group-hover:scale-100 scale-90 transition-transform">
                         <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg">
                            <Camera className="w-8 h-8 text-white" />
                         </div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-white">Change Photo</p>
                      </div>
                   </div>
                </div>
                <div className="absolute -bottom-4 -right-4 p-4 rounded-xl bg-accent text-white border-4 border-background shadow-lg shadow-accent/20">
                   <Check className="w-6 h-6" />
                </div>
              </div>
              
              <div className="text-center space-y-4 opacity-40 group-hover:opacity-100 transition-opacity">
                 <div className="flex items-center justify-center gap-2 text-accent">
                    <ShieldCheck className="w-4 h-4" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Profile Authenticated</p>
                 </div>
                 <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto opacity-60">
                    Your profile data is protected by industry standard encryption protocols.
                 </p>
              </div>
           </div>

           {/* Form Section */}
           <div className="lg:col-span-8">
               <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
                <div className="glass-card p-6 md:p-12 border-accent/10 shadow-xl rounded-[1.5rem] sm:rounded-[2.5rem] space-y-8 sm:space-y-10 relative overflow-hidden backdrop-blur-xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3 group">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                           <User className="w-3.5 h-3.5" />
                           First Name
                        </label>
                        <input 
                           type="text"
                           value={formData.firstName}
                           onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                           className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-surface border border-border rounded-xl font-bold text-lg sm:text-xl text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 uppercase"
                           placeholder="e.g. John"
                           required
                        />
                      </div>

                      <div className="space-y-3 group">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                           <User className="w-3.5 h-3.5" />
                           Last Name
                        </label>
                        <input 
                           type="text"
                           value={formData.lastName}
                           onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                           className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-surface border border-border rounded-xl font-bold text-lg sm:text-xl text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 uppercase"
                           placeholder="e.g. Doe"
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3 group">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                           <Car className="w-3.5 h-3.5" />
                           Vehicle Model
                        </label>
                        <input 
                           type="text"
                           value={formData.vehicleModel}
                           onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                           className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-surface border border-border rounded-xl font-bold text-lg sm:text-xl text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 uppercase"
                           placeholder="e.g. Tesla Model 3"
                           required
                        />
                      </div>

                      <div className="space-y-3 group">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                           <ShieldCheck className="w-3.5 h-3.5" />
                           Plate Number
                        </label>
                        <input 
                           type="text"
                           value={formData.plateNumber}
                           onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                           className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-surface border border-border rounded-xl font-bold text-lg sm:text-xl text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 uppercase"
                           placeholder="e.g. ABC 123"
                           required
                        />
                      </div>
                   </div>

                   <div className="space-y-3 group opacity-40">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 flex items-center gap-2">
                       <Mail className="w-3.5 h-3.5" />
                       Email Address (Immutable)
                     </label>
                     <div className="relative">
                       <input 
                         type="email"
                         value={formData.email}
                         disabled
                          className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-background border border-border rounded-xl font-bold text-lg sm:text-xl text-primary/40 outline-none cursor-not-allowed font-mono"
                       />
                     </div>
                   </div>

                   <div className="space-y-3 opacity-40 grayscale group hover:grayscale-0 focus-within:grayscale-0 transition-all relative">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 flex items-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5" />
                       Immutable Primary Link
                     </label>
                     <div className="relative">
                        <input 
                          type="text"
                          value={(user as any).mobile || (user as any).phone || ''}
                          disabled
                           className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-background border border-border rounded-xl font-bold text-lg sm:text-xl text-primary/40 cursor-not-allowed tracking-widest"
                        />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                           <p className="text-[9px] font-bold uppercase tracking-widest text-accent/60">Phone Locked</p>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="flex flex-col gap-8">
                   <button 
                    type="submit"
                    disabled={loading}
                    className={`btn-primary w-full h-14 sm:h-16 text-xs sm:text-sm gap-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{loading ? 'Syncing...' : 'Sync Changes'}</span>
                  </button>
                  
                  <div className="flex items-center justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity duration-300">
                     <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-accent" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Network: Stable</p>
                     </div>
                     <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                     <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-accent" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hub Latency: 12ms</p>
                     </div>
                  </div>
                </div>
              </form>
           </div>
        </main>
      </div>
      
      <footer className="mt-32 text-center opacity-10 hover:opacity-100 transition-opacity duration-700">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hive Partner OS • Profile Update Terminal</p>
      </footer>
    </div>
  );
};

export default ProfileEdit;
