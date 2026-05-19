import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, User, Zap, LayoutGrid, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/services', icon: Zap, label: 'Services' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop Header (Hidden on Mobile) */}
      <nav className="hidden md:flex sticky top-0 z-50 w-full h-20 bg-background/70 backdrop-blur-2xl border-b border-border px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between w-full relative">
          
          {/* Brand Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-3 group relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-accent blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-xl"></div>
              <div className="relative w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-background shadow-lg shadow-accent/20 transition-transform group-hover:scale-105 overflow-hidden">
                 <LayoutGrid className="w-6 h-6" />
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-primary leading-none">
                RIDE<span className="text-accent">HIVE</span>
              </span>
              <span className="text-[8px] font-bold text-muted uppercase tracking-[0.3em] mt-1">Mobility Matrix</span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-1 p-1 bg-surface/50 border border-border rounded-2xl relative">
            {navItems.map((item) => {
              const isActive = pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 group ${
                    isActive ? 'text-accent' : 'text-secondary hover:text-primary'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-background border border-border shadow-sm rounded-xl z-0 animate-in fade-in zoom-in-95 duration-300"></div>
                  )}
                  <item.icon className={`w-4 h-4 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="relative z-10">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5 relative z-10">
            <div className="h-8 w-px bg-border"></div>
            <ThemeToggle />
            <NavLink
              to="/profile"
              className="group relative"
            >
              <div className="absolute inset-0 bg-accent blur-sm opacity-0 group-hover:opacity-20 transition-opacity rounded-full"></div>
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden hover:border-accent transition-all duration-300 group-active:scale-90 shadow-sm">
                 <User className="w-6 h-6 text-secondary group-hover:text-accent transition-colors" />
              </div>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Mobile Unified Command Bar (Bottom Navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          
          {/* Top Actions Floating Row (Theme toggle and extra) */}
          <div className="flex justify-end mb-4 pr-2">
             <ThemeToggle />
          </div>

          {/* Main Navigation Bar */}
          <div className="h-20 bg-background/80 backdrop-blur-3xl border border-border rounded-[2.5rem] flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden px-4">
            
            {/* Active Highlight Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-accent/20 blur-xl"></div>

            {navItems.map((item, idx) => {
              const isActive = pathname === item.to;
              
              // Special styling for the "Hive" (Center) button if we wanted to add it
              // But for now we just use the 4 standard items
              
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative flex flex-col items-center justify-center w-14 h-14 transition-all duration-500 group ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {/* Floating active orb */}
                  {isActive && (
                    <div className="absolute -top-1 w-1 h-1 bg-accent rounded-full shadow-[0_0_12px_rgba(59,130,246,1)]"></div>
                  )}

                  <div className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-500 ${
                    isActive ? 'scale-110 -translate-y-1' : 'group-active:scale-90'
                  }`}>
                    <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-500 ${
                      isActive ? 'bg-accent/15 border border-accent/20 shadow-inner shadow-accent/10' : 'group-hover:bg-surface'
                    }`}>
                      <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-40 scale-75'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
