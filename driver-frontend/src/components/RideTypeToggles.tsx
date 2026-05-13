import React from 'react';
import { Zap, Users, Shield } from 'lucide-react';

interface RideTypeTogglesProps {
  normalMode: boolean;
  poolMode: boolean;
  onToggleNormal: () => void;
  onTogglePool: () => void;
  isOnline: boolean;
}

const RideTypeToggles: React.FC<RideTypeTogglesProps> = ({ 
  normalMode, 
  poolMode, 
  onToggleNormal, 
  onTogglePool,
  isOnline 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <button
        onClick={onToggleNormal}
        disabled={!isOnline}
        className={`flex-1 glass-card p-6 flex items-center justify-between transition-all relative overflow-hidden group ${
          !isOnline ? 'opacity-50 grayscale cursor-not-allowed' : ''
        } ${normalMode ? 'border-accent/40 bg-accent/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-border'}`}
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            normalMode ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-surface text-muted'
          }`}>
            <Zap className={`w-6 h-6 ${normalMode ? 'fill-current' : ''}`} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Intercept Mode</p>
            <h3 className="text-lg font-bold text-primary tracking-tight uppercase">Single Target</h3>
          </div>
        </div>
        
        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${normalMode ? 'bg-accent' : 'bg-border/30'}`}>
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${normalMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
        
        {normalMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 animate-scan"></div>
        )}
      </button>

      <button
        onClick={onTogglePool}
        disabled={!isOnline}
        className={`flex-1 glass-card p-6 flex items-center justify-between transition-all relative overflow-hidden group ${
          !isOnline ? 'opacity-50 grayscale cursor-not-allowed' : ''
        } ${poolMode ? 'border-blue-500/40 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-border'}`}
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            poolMode ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-surface text-muted'
          }`}>
            <Users className={`w-6 h-6 ${poolMode ? 'fill-current' : ''}`} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Intercept Mode</p>
            <h3 className="text-lg font-bold text-primary tracking-tight uppercase">Multi Target</h3>
          </div>
        </div>

        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${poolMode ? 'bg-blue-500' : 'bg-border/30'}`}>
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${poolMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>

        {poolMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 animate-scan"></div>
        )}
      </button>
    </div>
  );
};

export default RideTypeToggles;
