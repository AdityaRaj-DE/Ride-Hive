import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Star, ShieldCheck, Activity, Sparkles, MessageSquare, Fingerprint } from 'lucide-react';

interface FeedbackModalProps {
  rideId: string;
  riderId: string;
  onClose: () => void;
}

export default function FeedbackModal({ rideId, riderId, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select an authorization level (Rating)");
      return;
    }

    setLoading(true);
    try {
      await api.post("/feedback/submit", {
        rideId,
        toId: riderId,
        rating,
        comment,
        role: "DRIVER_TO_RIDER",
      });
      toast.success("Feedback successfully hashed!");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit feedback pulse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-bg-primary/95 backdrop-blur-3xl animate-in fade-in duration-1000">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="premium-card p-12 md:p-16 glass-panel border border-emerald-500/30 shadow-[0_128px_256px_rgba(0,0,0,1)] max-w-xl w-full relative overflow-hidden rounded-[5rem] backdrop-blur-3xl group"
        >
          {/* Dynamic Corner HUD Pulse */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000"></div>

          <header className="mb-14 text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_32px_64px_rgba(16,185,129,0.2)] group-hover:rotate-12 transition-transform duration-1000">
                <ShieldCheck className="w-10 h-10 shadow-[0_0_20px_rgba(16,185,129,1)]" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-main leading-none">Post-Discharge <span className="text-emerald-500">Audit</span></h2>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-30 mt-4 leading-relaxed max-w-sm mx-auto italic">Synchronize the client's behavioral metadata with the regional hive directory.</p>
            </div>
          </header>

          <footer className="space-y-12 relative z-10">
            <div className="flex flex-col items-center gap-6">
               <p className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500 opacity-60 italic">Authorization Level</p>
               <div className="flex justify-center gap-6">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     onMouseEnter={() => setHoverRating(star)}
                     onMouseLeave={() => setHoverRating(0)}
                     onClick={() => setRating(star)}
                     className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group/star ${
                       star <= (hoverRating || rating) 
                       ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                       : "bg-white/[0.02] text-white/5 border border-white/5"
                     }`}
                   >
                     <Star 
                        className={`w-7 h-7 transition-all duration-500 ${star <= (hoverRating || rating) ? "fill-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] rotate-12" : "group-hover/star:text-emerald-500/40"}`} 
                     />
                   </button>
                 ))}
               </div>
            </div>

            <div className="relative group/input">
              <div className="absolute left-6 top-8 text-emerald-500/40 group-focus-within/input:text-emerald-500 transition-colors">
                 <MessageSquare className="w-6 h-6" />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="REGIONAL LOG NOTES..."
                className="w-full h-40 bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 pl-16 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.04] transition-all resize-none shadow-2xl italic placeholder:opacity-5"
              />
              <div className="absolute bottom-6 right-8 opacity-10 group-focus-within/input:opacity-100 transition-opacity">
                <Fingerprint className="w-6 h-6 text-emerald-500 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-24 rounded-[3rem] bg-emerald-500 text-white font-black uppercase italic text-sm tracking-[0.8em] shadow-[0_64px_128px_rgba(16,185,129,0.3)] hover:scale-[1.05] active:scale-95 transition-all duration-1000 group/btn relative overflow-hidden shadow-2xl disabled:opacity-20 disabled:grayscale"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-6">
                   {loading ? "Syncing..." : "Finalize Audit"} 
                   <Activity className="w-8 h-8 group-hover/btn:animate-pulse shadow-[0_0_15px_rgba(255,255,255,1)]" />
                </span>
              </button>
              
              <button
                onClick={onClose}
                className="text-muted-foreground text-[10px] font-black uppercase tracking-[1em] hover:text-rose-500 transition-all opacity-20 hover:opacity-100 py-4 italic"
              >
                Relinquish Audit
              </button>
            </div>
            
            <footer className="pt-8 border-t border-white/5 flex items-center justify-center gap-10 opacity-20">
               <div className="flex items-center gap-3">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <p className="text-[8px] font-black uppercase tracking-[0.5em] italic">Behavioral Hash Stable</p>
               </div>
               <div className="flex items-center gap-3">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-[8px] font-black uppercase tracking-[0.5em] italic">Identity Sync: 100%</p>
               </div>
            </footer>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
