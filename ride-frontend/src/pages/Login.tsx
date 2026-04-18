import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp, fetchMe } from "../store/authSlice";
import type { RootState, AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";
import { Phone, Lock, ArrowRight, ShieldCheck, Zap, Globe, Activity } from 'lucide-react';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, otpSent, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const submitMobile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(sendOtp(mobile));
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(verifyOtp({ mobile, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      dispatch(fetchMe());
    }
  };

  useEffect(() => {
    if (user) {
      if (!user.onboarding?.rider) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen text-primary flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="text-center mb-12 space-y-6">
          <div className="w-20 h-20 bg-accent rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-accent/20 rotate-6 hover:rotate-0 transition-transform duration-700 border border-white/10">
             <Zap className="w-10 h-10 text-white fill-current" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary leading-tight">
              Ride<span className="text-accent">Hive</span>
            </h1>
            <p className="text-secondary text-base font-medium opacity-60">
              Premium Mobility Solutions for the Modern Professional.
            </p>
          </div>
        </header>

        <div className="glass-card p-10 md:p-12 border-accent/10 shadow-xl backdrop-blur-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12">
              <Globe className="w-48 h-48 text-accent" />
           </div>

          <header className="mb-10 text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-primary">
              {otpSent ? "Verify Identity" : "Welcome Back"}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent opacity-60">
              {otpSent ? "Verification code sent to mobile" : "Sign in to access your dashboard"}
            </p>
          </header>

          {!otpSent ? (
            <form onSubmit={submitMobile} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-bold text-lg text-primary placeholder:text-muted/10 tracking-wider"
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-top-2 duration-500 flex items-center gap-3">
                   <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                   Error: {error}
                </div>
              )}

              <button
                disabled={loading}
                className="btn-primary w-full h-14 text-sm gap-4"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                     <span>Connecting...</span>
                  </div>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-8 relative z-10 animate-in slide-in-from-right-4 duration-700">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   Security Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <input
                    type="text"
                    placeholder="      OTP"
                    className="w-full px-6 py-6 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-bold text-4xl text-center tracking-[0.4em] text-accent placeholder:text-muted/10"
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                   <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                   Code Mismatch: {error}
                </div>
              )}

              <button
                disabled={loading}
                className="btn-primary w-full h-14 text-sm gap-4"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                     <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2 text-[9px] font-bold text-secondary uppercase tracking-widest hover:text-accent transition-all flex items-center justify-center gap-2 opacity-40 hover:opacity-100"
              >
                <Activity className="w-3.5 h-3.5" />
                Resend Verification Code
              </button>
            </form>
          )}
        </div>
      </div>
      
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center opacity-20 w-full px-6">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hive OS • Secure Session Management</p>
      </footer>
    </div>
  );
}
