import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="navbar-glass px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-background font-bold text-xl transition-transform group-hover:scale-110">
            H
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">
            Ride<span className="text-accent">Hive</span>
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-surface text-accent shadow-sm'
                    : 'text-secondary hover:bg-surface/50 hover:text-primary'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NavLink
            to="/profile"
            className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden hover:border-accent transition-colors transition-all duration-200"
          >
            <User className="w-5 h-5 text-secondary" />
          </NavLink>
        </div>
      </div>

      {/* Mobile Navigation (Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-muted hover:text-secondary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
