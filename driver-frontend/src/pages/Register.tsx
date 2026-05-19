import React, {
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Activity, 
  Globe, 
  CheckCircle2,
  Sparkles,
  Fingerprint,
  Zap
} from 'lucide-react';

type Step = 0 | 1 | 2;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [step, setStep] = useState<Step>(0);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    mobileNumber: "",
    licenseNumber: "",
    vehicleColor: "",
    plate: "",
    capacity: 1,
    vehicleType: "car",
    password: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "capacity"
          ? Number(value) || 1
          : value,
    }));
  };

  const handleColorChoose = (colorName: string) => {
    setForm((prev) => ({ ...prev, vehicleColor: colorName }));
  };

  const nextStep = () => {
    if (step === 0) {
      if (!form.firstname || !form.email || !form.mobileNumber) {
        setErrorMsg("Please provide your name, email, and mobile number.");
        return;
      }
    }
    if (step === 1) {
      if (!form.licenseNumber || !form.vehicleColor || !form.plate) {
        setErrorMsg("Please provide license, vehicle color, and plate number.");
        return;
      }
    }
    setErrorMsg("");
    setStep((prev) => (prev + 1) as Step);
  };

  const prevStep = () => {
    setErrorMsg("");
    setStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.password || form.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      await api.post("/auth/drivers/register", {
        fullname: {
          firstname: form.firstname,
          lastname: form.lastname,
        },
        email: form.email,
        mobileNumber: form.mobileNumber,
        password: form.password,
        licenseNumber: form.licenseNumber,
        vehicle: {
          color: form.vehicleColor,
          plate: form.plate,
          capacity: Number(form.capacity),
          vehicleType: form.vehicleType,
        },
      });

      alert("Driver registered successfully");
      navigate("/driver/login");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error(error);
      setErrorMsg(error?.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { name: "White", sample: "#f5f5f5" },
    { name: "Black", sample: "#111111" },
    { name: "Silver", sample: "#c0c0c0" },
    { name: "Blue", sample: "#1e3a8a" },
    { name: "Red", sample: "#b91c1c" },
  ];

  return (
    <div className="min-h-screen text-primary flex flex-col items-center p-6 sm:p-10">
      <div className="w-full max-w-6xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20">
                   <Globe className="w-5 h-5" />
                </div>
                <div className="px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
                   Partner Onboarding v2.4
                </div>
             </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
                Join the <span className="text-accent">Fleet</span>
              </h1>
             <p className="text-secondary text-sm md:text-xl font-medium max-w-2xl mx-auto lg:mx-0 opacity-60 leading-relaxed">
               Start your journey as a professional driver partner. Complete the enrollment below.
             </p>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-4 opacity-30">
             <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-right">Secure Verification</p>
                <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-accent">
                   <Fingerprint className="w-5 h-5" />
                </div>
             </div>
             <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-right">Instant Approval Hub</p>
                <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-accent">
                   <Activity className="w-5 h-5" />
                </div>
             </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-8 sm:mb-16 px-4 max-w-2xl mx-auto lg:mx-0">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Enrollment Progress</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted opacity-40">Step {step + 1} of 3</span>
           </div>
           <div className="flex gap-4">
             {[0, 1, 2].map((s) => (
                <div key={s} className="flex-1 h-2 rounded-full bg-surface border border-border overflow-hidden">
                   <div 
                     className={`h-full bg-accent transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.3)] ${step >= s ? "w-full" : "w-0"}`}
                   />
                </div>
             ))}
           </div>
        </div>

        <main className="grid grid-cols-1 gap-12">
            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-16 border-accent/10 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[400px] sm:min-h-[500px]">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12">
                 <ShieldCheck className="w-64 h-64 text-accent" />
              </div>

              {step === 0 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-2">
                     <h2 className="text-lg sm:text-3xl font-bold tracking-tight text-primary uppercase">Profile <span className="text-accent">Information</span></h2>
                     <p className="text-sm text-secondary font-medium opacity-60">Establish your professional identity in our network.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                        First Name
                      </label>
                      <input
                        name="firstname"
                        value={form.firstname}
                        placeholder="e.g. John"
                        onChange={handleChange}
                        className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl font-semibold text-base sm:text-lg text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                        Last Name
                      </label>
                      <input
                        name="lastname"
                        value={form.lastname}
                        placeholder="e.g. Doe"
                        onChange={handleChange}
                        className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl font-semibold text-base sm:text-lg text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      placeholder="john@example.com"
                      onChange={handleChange}
                      className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl font-semibold text-base sm:text-lg text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                      Mobile Number
                    </label>
                    <input
                      name="mobileNumber"
                      value={form.mobileNumber}
                      placeholder="9876543210"
                      onChange={handleChange}
                      className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl font-bold tracking-[0.1em] text-base sm:text-lg text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-2">
                     <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-primary uppercase">Vehicle <span className="text-accent">Details</span></h2>
                     <p className="text-sm text-secondary font-medium opacity-60">Register your primary vehicle for road operations.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1 text-xs">
                      Driving License Number
                    </label>
                    <input
                      name="licenseNumber"
                      value={form.licenseNumber}
                      placeholder="DL-0000-0000-0000"
                      onChange={handleChange}
                      className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl font-bold text-base sm:text-lg text-accent outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 uppercase tracking-widest"
                      required
                    />
                  </div>

                  <div className="space-y-6">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                      Vehicle Color
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {colorOptions.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleColorChoose(c.name)}
                          className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all ${
                            form.vehicleColor === c.name
                              ? "border-accent bg-accent/10 shadow-sm"
                              : "border-border bg-surface hover:border-accent/40"
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-md border border-border shadow-inner"
                            style={{ backgroundColor: c.sample }}
                          />
                          <span className="text-[11px] font-bold uppercase tracking-widest">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1 text-xs">
                      Vehicle Plate Number
                    </label>
                    <input
                      name="plate"
                      value={form.plate}
                      placeholder="TS-00-AA-0000"
                      onChange={handleChange}
                      className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl font-bold text-base sm:text-lg text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 uppercase tracking-widest"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                        Seating Capacity
                      </label>
                      <input
                        name="capacity"
                        type="number"
                        min={1}
                        value={form.capacity}
                        onChange={handleChange}
                        className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl font-bold text-base sm:text-lg text-primary outline-none focus:border-accent/40 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                        Vehicle Category
                      </label>
                      <div className="relative">
                        <select
                          name="vehicleType"
                          value={form.vehicleType}
                          onChange={handleChange}
                          className="w-full px-6 py-3 sm:py-4 bg-surface border border-border rounded-xl font-bold text-sm sm:text-base text-primary outline-none focus:border-accent/40 transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="car">Sedan / Hatchback</option>
                          <option value="motorcycle">Motorcycle</option>
                          <option value="auto">Auto Rikshaw</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                           <ChevronRight className="w-5 h-5 rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="space-y-2">
                     <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-primary uppercase">Security <span className="text-accent">Access</span></h2>
                     <p className="text-sm text-secondary font-medium opacity-60">Create a secure password for your terminal access.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest ml-1">
                      Account Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      placeholder="••••••••"
                      onChange={handleChange}
                      className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-surface border border-border rounded-2xl font-bold text-xl sm:text-2xl text-center tracking-[0.4em] outline-none focus:border-accent/40 transition-all placeholder:text-muted/10 shadow-inner"
                      required
                    />
                  </div>

                  <div className="p-8 rounded-2xl bg-accent/5 border border-accent/10 flex items-center gap-6">
                     <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
                        <ShieldCheck className="w-6 h-6 text-accent" />
                     </div>
                     <p className="text-[11px] font-bold text-secondary opacity-60 uppercase tracking-widest leading-relaxed italic">
                       Password must be secure and unique. Shared access to driver profiles is strictly prohibited as per regional node policy.
                     </p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mt-10 p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-top-2 flex items-center gap-4">
                   <div className="w-1.5 h-6 bg-rose-500 rounded-full animate-pulse"></div>
                   Registration Error: {errorMsg}
                </div>
              )}

              {/* Navigation Hub */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 sm:mt-16 pt-6 sm:pt-10 border-t border-border gap-6 relative z-10">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl border border-border text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:bg-surface transition-all flex items-center gap-2 sm:gap-3 active:scale-95 italic"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Previous
                  </button>
                ) : (
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted opacity-40">
                      Already a Partner? <Link to="/driver/login" className="text-accent underline underline-offset-4 ml-1">Sign In</Link>
                    </p>
                  </div>
                )}

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="h-12 sm:h-14 px-6 sm:px-10 rounded-xl bg-accent text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 sm:gap-3"
                  >
                    Next Step
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 sm:h-14 px-6 sm:px-10 rounded-xl bg-accent text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 sm:gap-4"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Finalizing...</span>
                      </div>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
        </main>
        
        <footer className="mt-24 text-center space-y-8 opacity-20 hover:opacity-100 transition-opacity duration-700 pb-16">
           <div className="flex items-center justify-center gap-4">
              <Zap className="w-4 h-4 text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Hive Professional Partner Network</p>
              <Sparkles className="w-4 h-4 text-accent" />
           </div>
           <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
             By joining our partner network, you agree to the regional transport service terms, background check protocols, and data protection guidelines.
           </p>
        </footer>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
