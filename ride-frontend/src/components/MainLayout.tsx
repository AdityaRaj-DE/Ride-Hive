import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isFullBleed = ['/ride', '/map-picker'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary">
      <Navbar />
      <main className={`flex-1 flex flex-col ${isFullBleed ? 'p-0' : 'p-mobile-safe max-w-7xl mx-auto w-full'}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
