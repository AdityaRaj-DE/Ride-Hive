import React from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
  fullContent?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, fullContent }) => {
  return (
    <div className="min-h-screen bg-background text-primary transition-colors duration-200 flex flex-col">
      <Navbar />
      <main className={`flex-1 transition-all duration-300 ${fullContent ? 'w-full' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
