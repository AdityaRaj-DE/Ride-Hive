import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Star, Send, X, ShieldCheck, MessageSquare, Heart } from 'lucide-react';

interface FeedbackModalProps {
  rideId: string;
  driverId: string;
  onClose: () => void;
}

export default function FeedbackModal({ rideId, driverId, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      await api.post("/feedback/submit", {
        rideId,
        toId: driverId,
        rating,
        comment,
        role: "RIDER_TO_DRIVER",
      });
      toast.success("Feedback submitted successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-background/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card p-6 sm:p-10 max-w-lg w-full relative overflow-hidden"
        >
          {/* Subtle Background Ornament */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
             <MessageSquare className="w-32 h-32 text-accent" />
          </div>

          <div className="text-center mb-8 relative z-10">
             <div className="flex items-center justify-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-accent fill-current" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Rate your trip</p>
             </div>
             <h2 className="text-2xl font-bold tracking-tight text-primary mb-2">How was your ride?</h2>
             <p className="text-sm text-secondary font-medium">Your feedback helps us improve the Hive experience.</p>
          </div>

          {/* Star Rating Grid */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-8 relative z-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 border-2 active:scale-90 ${
                  star <= rating 
                  ? "bg-accent/10 border-accent/30 text-accent shadow-lg shadow-accent/5" 
                  : "bg-surface border-border text-muted hover:border-accent/30 hover:text-accent/60"
                }`}
              >
                <Star className={`w-6 h-6 sm:w-7 sm:h-7 ${star <= rating ? "fill-current" : ""}`} />
              </button>
            ))}
          </div>

          {/* Comment Area */}
          <div className="relative mb-8 z-10">
             <textarea
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               placeholder="Add a comment (optional)..."
               className="w-full h-32 bg-surface border border-border rounded-xl p-4 text-sm font-medium text-primary outline-none focus:border-accent/50 transition-all placeholder:text-muted resize-none"
             />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 relative z-10">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full h-14 text-base gap-3 disabled:opacity-50"
            >
               {loading ? "Submitting..." : "Submit Feedback"}
               <Send className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-surface border border-border text-secondary font-bold uppercase tracking-widest text-[10px] hover:bg-background transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Skip for now
            </button>
          </div>

          {/* Footer Branding */}
          <div className="mt-8 flex items-center justify-center gap-4 opacity-30 pointer-events-none">
             <ShieldCheck className="w-3 h-3 text-accent" />
             <p className="text-[9px] font-bold uppercase tracking-widest">Secure Submission</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

