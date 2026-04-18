import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Zap, Sparkles } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-16 rounded-[1.25rem] bg-white/[0.02] border border-white/10 flex items-center justify-center transition-all duration-700 hover:border-emerald-500/50 hover:scale-110 active:scale-95 group overflow-hidden shadow-2xl backdrop-blur-3xl"
      aria-label="Toggle Regional Illumination"
    >
      {/* Dynamic Background Pulse */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === 'light' ? 'bg-amber-500/5 opacity-100' : 'bg-emerald-500/5 opacity-0 group-hover:opacity-100'}`}></div>
      
      {theme === 'light' ? (
        <div className="relative z-10 flex items-center justify-center animate-in zoom-in-50 duration-700">
           <Sun className="w-6 h-6 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:rotate-90 transition-transform duration-1000" />
           <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-pulse" />
        </div>
      ) : (
        <div className="relative z-10 flex items-center justify-center animate-in zoom-in-50 duration-700">
           <Moon className="w-6 h-6 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:-rotate-12 transition-transform duration-1000" />
           <Zap className="absolute -top-1 -right-1 w-3 h-3 text-emerald-400 fill-emerald-400 animate-pulse" />
        </div>
      )}
      
      {/* Scanning Line Effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/20 opacity-0 group-hover:opacity-100 animate-[scan_2s_linear_infinite] pointer-events-none"></div>
    </button>
  );
};

export default ThemeToggle;
