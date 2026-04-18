import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { User, Mail, Phone, ArrowLeft, Check, Camera, Briefcase, ShieldCheck, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  
  const [formData, setFormData] = useState({
    name: (user as any)?.name || '',
    email: (user as any)?.email || '',
    experience: '3.2 Years',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating driver profile:", formData);
    navigate('/driver/profile');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-5xl mx-auto px-6 pt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-16 flex items-center gap-8">
          <button 
            onClick={() => navigate('/driver/profile')}
            className="h-14 w-14 rounded-xl bg-surface border border-border flex items-center justify-center text-primary hover:bg-background hover:border-accent/40 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Security Verified</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary leading-tight uppercase">
               Edit <span className="text-accent">Profile</span>
            </h1>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           {/* Avatar Section */}
           <div className="lg:col-span-4 flex flex-col items-center gap-10">
              <div className="relative group">
                <div className="w-64 h-64 bg-accent/5 rounded-[3.5rem] flex items-center justify-center border-2 border-accent/10 shadow-inner overflow-hidden relative backdrop-blur-xl">
                   <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <span className="text-accent text-9xl font-bold uppercase tracking-tighter relative z-10">
                     {(formData.name.charAt(0)) || 'D'}
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
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="glass-card p-10 md:p-12 border-accent/10 shadow-xl rounded-[2.5rem] space-y-10 relative overflow-hidden backdrop-blur-xl">
                   <div className="space-y-3 group">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                       <User className="w-3.5 h-3.5" />
                       Full Name
                     </label>
                     <div className="relative">
                       <input 
                         type="text"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="w-full px-8 py-4 bg-surface border border-border rounded-xl font-bold text-xl text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 uppercase"
                         placeholder="e.g. John Doe"
                       />
                     </div>
                   </div>

                   <div className="space-y-3 group">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                       <Mail className="w-3.5 h-3.5" />
                       Email Address
                     </label>
                     <div className="relative">
                       <input 
                         type="email"
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="w-full px-8 py-4 bg-surface border border-border rounded-xl font-bold text-xl text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10"
                         placeholder="john@example.com"
                       />
                     </div>
                   </div>

                   <div className="space-y-3 group">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                       <Briefcase className="w-3.5 h-3.5" />
                       Experience
                     </label>
                     <div className="relative">
                       <input 
                         type="text"
                         value={formData.experience}
                         onChange={(e) => setFormData({...formData, experience: e.target.value})}
                         className="w-full px-8 py-4 bg-surface border border-border rounded-xl font-bold text-xl text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 uppercase"
                         placeholder="e.g. 5 Years"
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
                          value={(user as any).mobile}
                          disabled
                          className="w-full px-8 py-4 bg-background border border-border rounded-xl font-bold text-xl text-primary/40 cursor-not-allowed tracking-widest"
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
                    className="btn-primary w-full h-16 text-sm gap-4"
                  >
                    <Check className="w-5 h-5" />
                    <span>Synchronize Profile Changes</span>
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
