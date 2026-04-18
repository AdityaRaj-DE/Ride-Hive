import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { completeRiderOnboarding } from "../store/riderSlice";
import type { RootState, AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";
import { User, Mail, ArrowRight, Sparkles, ShieldCheck, Activity } from 'lucide-react';

export default function RiderOnboarding() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.rider);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: {
        first: form.firstname,
        last: form.lastname,
      },
      email: form.email,
    };

    const result = await dispatch(completeRiderOnboarding(payload));
    if (completeRiderOnboarding.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen text-primary flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent mb-8 mx-auto backdrop-blur-md">
             <Sparkles className="w-4 h-4 fill-current" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Account Setup</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
            Personal <span className="text-accent">Details</span>
          </h1>
          <p className="text-secondary text-base font-medium max-w-xl mx-auto opacity-60">
            Please provide your information to complete your registration and start using Hive.
          </p>
        </header>

        <div className="glass-card p-10 md:p-12 border-accent/10 shadow-xl backdrop-blur-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none rotate-12">
              <ShieldCheck className="w-48 h-48 text-accent" />
           </div>

          <form onSubmit={submit} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 group">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   First Name
                </label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <input
                    placeholder="e.g. John"
                    className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary placeholder:text-muted/10"
                    onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3 group">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <input
                    placeholder="e.g. Doe"
                    className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary placeholder:text-muted/10"
                    onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 group">
              <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                 <div className="w-2 h-2 rounded-full bg-accent"></div>
                 Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-semibold text-lg text-primary placeholder:text-muted/10"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-2 ml-1 opacity-40">
                 <Activity className="w-3.5 h-3.5 text-accent" />
                 <p className="text-[9px] font-bold uppercase tracking-widest">Encrypted communication channel active</p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-top-2 duration-500 flex items-center gap-3">
                 <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                 Submission Error: {error}
              </div>
            )}

            <button
              disabled={loading}
              className="btn-primary w-full h-16 text-sm gap-4"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                   <span>Saving...</span>
                </div>
              ) : (
                <>
                  <span>Complete My Registration</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center opacity-20 w-full px-6">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hive OS • Secure Rider Onboarding</p>
      </footer>
    </div>
  );
}
