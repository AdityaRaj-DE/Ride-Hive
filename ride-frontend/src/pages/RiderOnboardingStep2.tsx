import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateRiderProfile } from "../store/riderSlice";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../store";
import { User, Calendar, Phone, Heart, Users, ArrowRight, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

export default function RiderOnboardingStep2() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    gender: "",
    dob: "",
    ecName: "",
    ecPhone: "",
    ecRelation: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      gender: form.gender,
      dob: form.dob,
      emergencyContact: {
        name: form.ecName,
        phone: form.ecPhone,
        relation: form.ecRelation,
      },
    };

    await dispatch(updateRiderProfile(payload));
    navigate("/dashboard");
  };

  const skip = () => navigate("/dashboard");

  return (
    <div className="min-h-screen text-primary flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-3xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent mb-8 mx-auto backdrop-blur-md">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Safety First</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
            Security <span className="text-accent">Profile</span>
          </h1>
          <p className="text-secondary text-base font-medium max-w-xl mx-auto opacity-60">
            Help us protect you by providing emergency contact information and basic demographics.
          </p>
        </header>

        <div className="glass-card p-10 md:p-12 border-accent/10 shadow-xl backdrop-blur-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none rotate-12">
              <Users className="w-48 h-48 text-accent" />
           </div>

          <form onSubmit={submit} className="space-y-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   Gender
                </label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <select
                    className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary appearance-none cursor-pointer"
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-focus-within:opacity-100">
                     <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <input
                    type="date"
                    className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary uppercase"
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-border">
               <div className="flex items-center gap-3 opacity-60">
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Emergency Contact</h3>
               </div>

               <div className="space-y-6">
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                    <input 
                      placeholder="Contact Name" 
                      className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary placeholder:text-muted/10" 
                      onChange={(e)=>setForm({...form, ecName:e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                      <input 
                        placeholder="Contact Phone" 
                        className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary placeholder:text-muted/10"
                        onChange={(e)=>setForm({...form, ecPhone:e.target.value})}
                      />
                    </div>

                    <div className="relative group">
                      <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                      <input 
                        placeholder="Relationship" 
                        className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary placeholder:text-muted/10"
                        onChange={(e)=>setForm({...form, ecRelation:e.target.value})}
                      />
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6 pt-6">
              <button className="btn-primary w-full h-16 text-sm gap-4">
                <span>Save Profile Information</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button 
                type="button" 
                onClick={skip}
                className="w-full py-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-accent transition-all flex items-center justify-center gap-2 opacity-40 hover:opacity-100"
              >
                Skip for Now
                <Activity className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center opacity-20 w-full px-6">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hive OS • Safety Verification Terminal</p>
      </footer>
    </div>
  );
}
