import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Lock, ArrowRight, ShieldCheck, Zap, Globe, Activity } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3000/auth';

  const submitMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${AUTH_URL}/otp/send`, { mobileNumber: mobile });
      setOtpSent(true);
      toast.success("OTP sent to your mobile");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${AUTH_URL}/otp/verify`, { 
        mobileNumber: mobile, 
        otp, 
        deviceId: 'admin-console-' + Math.random().toString(36).slice(2, 9)
      });
      
      const { user, accessToken } = res.data;

      // Verify if user is actually an admin
      if (user.roles?.admin !== true) {
        toast.error("Access Denied: Admin privileges required");
        return;
      }

      // Store in localStorage
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      toast.success(`Welcome, Admin ${user.mobileNumber}`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-primary flex items-center justify-center p-6 sm:p-10 bg-background">
      {/* Background Gradients */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="text-center mb-12 space-y-6">
          <div className="w-20 h-20 bg-accent rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-accent/20 rotate-6 hover:rotate-0 transition-transform duration-700 border border-white/10">
             <Zap className="w-10 h-10 text-white fill-current" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary leading-tight font-display">
              Ride<span className="text-accent">Hive</span>
            </h1>
            <p className="text-secondary text-base font-medium opacity-60 uppercase tracking-widest text-[10px]">
              Centarlized Administration Console
            </p>
          </div>
        </header>

        <div className="glass-card p-10 md:p-12 border-accent/10 shadow-xl backdrop-blur-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12">
              <Globe className="w-48 h-48 text-accent" />
           </div>

          <header className="mb-10 text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-primary">
              {otpSent ? "Identity Verification" : "Admin Secure Portal"}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent opacity-60">
              {otpSent ? "Verification code sent to administrative mobile" : "Sign in to access secure infrastructure"}
            </p>
          </header>

          {!otpSent ? (
            <form onSubmit={submitMobile} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   Authorized Mobile
                </label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full pl-16 pr-6 py-4 bg-surface/30 border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-bold text-lg text-primary placeholder:text-muted/10 tracking-wider"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="btn-primary w-full h-14 text-sm gap-4"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                     <span>Validating...</span>
                  </div>
                ) : (
                  <>
                    <span>Proceed to Verification</span>
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
                   Administrative OTP
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-20" />
                  <input
                    type="text"
                    placeholder="      OTP"
                    className="w-full px-6 py-6 bg-surface/30 border border-border rounded-xl outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all font-bold text-4xl text-center tracking-[0.4em] text-accent placeholder:text-muted/10"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="btn-primary w-full h-14 text-sm gap-4"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                     <span>Verifying Admin...</span>
                  </div>
                ) : (
                  <>
                    <span>Unlock Dashboard</span>
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full py-2 text-[9px] font-bold text-secondary uppercase tracking-widest hover:text-accent transition-all flex items-center justify-center gap-2 opacity-40 hover:opacity-100"
              >
                <Activity className="w-3.5 h-3.5" />
                Change Mobile Number
              </button>
            </form>
          )}
        </div>
      </div>
      
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center opacity-20 w-full px-6">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Core Infrastructure Security • Node Admin v1.0</p>
      </footer>
    </div>
  );
}
