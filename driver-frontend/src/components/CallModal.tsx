// src/components/CallModal.tsx
import React from "react";
import { Phone, PhoneOff, Mic, MicOff, ShieldCheck, Activity, Timer, Zap, User } from 'lucide-react';

type CallModalProps = {
  open: boolean;
  onClose?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onHangup?: () => void;
  onToggleMute?: () => void;
  state: {
    incoming: boolean;
    ringing: boolean;
    inCall: boolean;
    connecting: boolean;
    muted: boolean;
    caller: { id?: string; name?: string } | null;
  };
  timerSec: number;
  roleLabel?: string; // "Driver" / "Rider"
};

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function CallModal({
  open,
  onAccept,
  onReject,
  onHangup,
  onToggleMute,
  state,
  timerSec,
  roleLabel = "Call",
}: CallModalProps) {
  if (!open) return null;

  const { incoming, ringing, inCall, connecting, muted, caller } = state;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-bg-primary/95 backdrop-blur-3xl animate-in fade-in duration-1000">
      <div className="absolute inset-0" onClick={() => onReject?.()} />
      
      <div className="relative z-[160] w-full max-w-xl premium-card p-12 md:p-16 glass-panel border border-white/10 shadow-[0_128_256px_rgba(0,0,0,1)] rounded-[5rem] backdrop-blur-3xl group overflow-hidden text-center">
        {/* Dynamic Atmospheric Pulse */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000"></div>

        <header className="mb-14 space-y-10 relative z-10">
           <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center border transition-all duration-1000 rotate-12 bg-white/[0.02] ${inCall || ringing || connecting ? 'border-emerald-500/50 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse' : 'border-white/10 text-muted-foreground'}`}>
                {caller?.name ? (
                   <span className="text-4xl font-black italic">{caller.name[0].toUpperCase()}</span>
                ) : (
                   <User className="w-10 h-10" />
                )}
              </div>
           </div>
           
           <div className="space-y-4">
              <div className={`inline-flex items-center gap-4 px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.6em] backdrop-blur-3xl italic shadow-inner ${inCall ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                 <Activity className={`w-4 h-4 ${inCall ? 'animate-pulse' : ''}`} />
                 {inCall ? "Active Frequency" : incoming ? "Inbound Intercept" : "Synchronizing..."}
              </div>
              <h2 className="text-5xl font-black italic tracking-tighter uppercase text-main leading-none mt-6">
                {(incoming ? (caller?.name || "Anonymous Pilot") : roleLabel)}
              </h2>
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30 italic">
                {inCall ? "L7 Encrypted Comm Link" : incoming ? "Regional node alpha inbound handshake" : "Establishing trajectory sync pulse"}
              </p>
           </div>
        </header>

        <div className="relative z-10 space-y-12">
          {inCall && (
            <div className="text-6xl font-black italic tracking-tighter text-emerald-500 animate-in zoom-in-95 duration-700">
               {fmtTime(timerSec)}
            </div>
          )}

          <div className="mt-12 flex flex-col gap-8">
            {incoming && !inCall && (
              <div className="flex gap-6 w-full">
                <button
                  onClick={() => onAccept?.()}
                  className="flex-1 h-24 rounded-[2.5rem] bg-emerald-500 text-white font-black uppercase italic text-sm tracking-[0.5em] shadow-[0_32px_64px_rgba(16,185,129,0.3)] hover:scale-[1.05] active:scale-95 transition-all duration-700 group/btn relative overflow-hidden flex items-center justify-center gap-6"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                   <Zap className="w-6 h-6 relative z-10 shadow-[0_0_15px_rgba(255,255,255,1)]" />
                   <span className="relative z-10">Authorize</span>
                </button>
                <button
                  onClick={() => onReject?.()}
                  className="flex-1 h-24 rounded-[2.5rem] bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-black uppercase italic text-sm tracking-[0.5em] transition-all duration-700 active:scale-95 flex items-center justify-center gap-6 shadow-2xl"
                >
                   <PhoneOff className="w-6 h-6" />
                   Discard
                </button>
              </div>
            )}

            {!incoming && !inCall && (ringing || connecting) && (
              <div className="text-center space-y-10">
                <div className="w-16 h-1 w-full max-w-[200px] mx-auto bg-white/5 rounded-full overflow-hidden mb-6">
                   <div className="h-full bg-emerald-500 animate-[shimmer_2s_infinite]"></div>
                </div>
                <button
                  onClick={() => onHangup?.()}
                  className="h-24 px-16 rounded-[2.5rem] bg-rose-500 text-white font-black uppercase italic text-sm tracking-[0.5em] shadow-[0_32px_64px_rgba(244,63,94,0.3)] hover:scale-[1.05] active:scale-95 transition-all duration-700 flex items-center justify-center gap-6 mx-auto group/btn relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-rose-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                   <PhoneOff className="w-7 h-7 relative z-10" />
                   <span className="relative z-10">Relinquish</span>
                </button>
              </div>
            )}

            {inCall && (
              <div className="flex flex-col gap-10">
                <div className="flex justify-center gap-8">
                  <button
                    onClick={() => onToggleMute?.()}
                    className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border transition-all duration-700 active:scale-90 shadow-2xl ${muted ? "bg-amber-500/20 text-amber-500 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "bg-white/[0.03] text-main border-white/10 hover:border-emerald-500/30"}`}
                  >
                    {muted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>

                  <button
                    onClick={() => onHangup?.()}
                    className="h-24 px-16 rounded-[2.5rem] bg-rose-500 text-white font-black uppercase italic text-sm tracking-[0.8em] shadow-[0_32px_64px_rgba(244,63,94,0.3)] hover:scale-[1.05] active:scale-95 transition-all duration-1000 group/btn relative overflow-hidden shadow-2xl flex items-center justify-center gap-8"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-rose-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                     <PhoneOff className="w-8 h-8 relative z-10" />
                     <span className="relative z-10">Finalize</span>
                  </button>
                </div>
                <div className="flex flex-col items-center gap-4 opacity-30 italic">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <p className="text-[9px] font-black uppercase tracking-[0.3em]">Quantum Encrypted Payload</p>
                   </div>
                   <p className="text-[8px] font-black tracking-[0.5em] uppercase">Regional Alpha-Node Hub Link Established</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footnote HUD */}
        <footer className="mt-16 text-center opacity-10 flex items-center justify-center gap-10 grayscale hover:grayscale-0 transition-all duration-1000">
           <div className="flex items-center gap-3">
              <Timer className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[7px] font-black uppercase tracking-[0.4em]">Latency: 14ms</p>
           </div>
           <div className="flex items-center gap-3">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[7px] font-black uppercase tracking-[0.4em]">Node: SVR-01</p>
           </div>
        </footer>
      </div>
    </div>
  );
}
