import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, User, History, ShieldCheck, Activity, Globe, Zap, Clock, Star } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  path: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, subtitle, path, color }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(path)}
      className="glass-card p-4 sm:p-6 flex flex-col items-start gap-3 sm:gap-4 hover:border-accent/50 transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12 group-hover:rotate-0 transition-transform duration-700`}>
        <Icon className={`w-24 h-24 text-${color}`} />
      </div>
      
      <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4 sm:w-6 h-6" />
      </div>
      
      <div className="text-left">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] text-${color} mb-1 opacity-70`}>{subtitle}</p>
        <h3 className="text-base sm:text-lg font-bold text-primary tracking-tight">{title}</h3>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
    </button>
  );
};

const HubFeatureGrid: React.FC = () => {
  const features = [
    { icon: Wallet, title: 'Wallet', subtitle: 'Yield Ledger', path: '/driver/wallet', color: 'accent' },
    { icon: History, title: 'History', subtitle: 'Logs', path: '/driver/history', color: 'blue-500' },
    { icon: User, title: 'Profile', subtitle: 'Identity', path: '/driver/profile', color: 'emerald-500' },
    { icon: Star, title: 'Ratings', subtitle: 'Feedback', path: '/driver/profile', color: 'amber-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {features.map((f, i) => (
        <FeatureCard key={i} {...f} />
      ))}
    </div>
  );
};

export default HubFeatureGrid;
