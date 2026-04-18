import { Search, Loader2 } from 'lucide-react';

export default function SearchingDriver() {
  return (
    <div className="glass-card flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center relative z-10">
          <Search className="w-10 h-10 text-accent animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping opacity-25"></div>
      </div>
      
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-primary tracking-tight">Finding your ride</h2>
        <p className="text-secondary text-sm max-w-[280px]">
          We're connecting with nearby drivers to find the best match for you.
        </p>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-full border border-border">
        <Loader2 className="w-4 h-4 text-accent animate-spin" />
        <span className="text-xs font-medium text-secondary uppercase tracking-widest">Searching...</span>
      </div>
    </div>
  );
}