import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center hover:border-accent transition-all duration-300 group overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className={`transition-all duration-500 transform ${theme === 'light' ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-10 opacity-0 rotate-90'}`}>
        <Moon className="w-5 h-5 text-secondary group-hover:text-accent" />
      </div>
      <div className={`absolute transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-10 opacity-0 -rotate-90'}`}>
        <Sun className="w-5 h-5 text-amber-400 group-hover:scale-110" />
      </div>
    </button>
  );
};

export default ThemeToggle;
