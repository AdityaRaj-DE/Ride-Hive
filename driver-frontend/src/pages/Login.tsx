import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp, activateRole, fetchMe } from "../store/slices/authSlice";
import type { RootState, AppDispatch } from "../store";
import { useNavigate, Link } from "react-router-dom";
import { Phone, Lock, ArrowRight, ShieldCheck, Zap, Activity, Globe } from 'lucide-react';

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
    const res = await dispatch(verifyOtp({ mobile, otp }));
    if (verifyOtp.fulfilled.match(res)) {
      await dispatch(activateRole("driver"));
      await dispatch(fetchMe());
    }
  };

  useEffect(() => {
    if (user) {
      if (!user.onboarding?.driver) {
        navigate("/driver/onboarding");
      } else {
        navigate("/driver/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen text-primary flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-6xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
        {/* Information Side */}
        <div className="space-y-10 text-center lg:text-left">
           <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                 <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20 transition-transform hover:rotate-6">
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                 </div>
                 <div className="px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
                    Driver Partner Network
                 </div>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
                Partner <span className="text-accent text-glow">Access</span>
              </h1>
              <p className="text-secondary text-base md:text-xl font-medium max-w-lg mx-auto lg:mx-0 opacity-60 leading-relaxed">
                Connect your professional driving profile to the Hive grid and start earning on your own terms.
              </p>
           </div>

           <div className="hidden lg:flex flex-col gap-6 opacity-30">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <p className="text-[10px] font-bold uppercase tracking-widest">Industrial Grade Security</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                    <Globe className="w-6 h-6" />
                 </div>
                 <p className="text-[10px] font-bold uppercase tracking-widest">Regional Hub Connectivity</p>
              </div>
           </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-16 border-accent/10 shadow-2xl relative overflow-hidden flex flex-col justify-center">
           <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12">
              <ShieldCheck className="w-64 h-64 text-accent" />
           </div>

          <header className="mb-12 text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-primary uppercase">
              {otpSent ? "Verify Identity" : "Sign In"}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent opacity-60">
              {otpSent ? "Enter the verification code" : "Broadcast your identifier to begin"}
            </p>
          </header>

          {!otpSent ? (
            <form onSubmit={submitMobile} className="space-y-10 relative z-10">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="w-full pl-16 pr-6 py-4 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-bold text-lg text-primary placeholder:text-muted/10 tracking-widest"
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-top-2 duration-500 flex items-center gap-3">
                   <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                   Connection Error: {error}
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
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <div className="pt-8 text-center text-[10px] font-bold uppercase tracking-widest opacity-40">
                 Dont have an account? <Link to="/driver/register" className="text-accent underline underline-offset-4 hover:opacity-100 transition-opacity ml-1">Register as Partner</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-10 relative z-10 animate-in slide-in-from-right-4 duration-700">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   Verification Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <input
                    type="text"
                    placeholder="      OTP"
                    className="w-full px-6 py-4 sm:py-6 bg-surface border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-bold text-2xl sm:text-4xl text-center tracking-[0.4em] text-accent placeholder:text-muted/10"
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                   <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                   Mismatch: {error}
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
                    <span>Verify & Continue</span>
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
                Resend Code
              </button>
            </form>
          )}
        </div>
      </div>
      
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center opacity-20 w-full px-6">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hive OS • Professional Driver Network</p>
      </footer>
    </div>
  );
}
