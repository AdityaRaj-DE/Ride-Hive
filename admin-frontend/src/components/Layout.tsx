import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Menu className="text-white w-5 h-5 cursor-pointer" onClick={() => setSidebarOpen(true)} />
             </div>
             <span className="font-bold tracking-tight">RideHive</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface border border-border" />
        </header>

        <div className="p-4 sm:p-8 relative">
          {/* Background Gradients */}
          <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none z-0" />
          <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-success/10 blur-[100px] rounded-full pointer-events-none z-0" />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
