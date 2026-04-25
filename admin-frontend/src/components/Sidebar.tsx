import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Database, 
  Terminal, 
  LogOut,
  Hexagon,
  ShieldAlert,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShieldAlert, label: 'Safety Hub', path: '/safety' },
    { icon: ShieldCheck, label: 'Driver Verification', path: '/drivers' },
    { icon: Database, label: 'Database Explorer', path: '/database' },
    { icon: Terminal, label: 'OTP Logs', path: '/logs' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success("Signed out successfully");
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`fixed lg:static inset-y-0 left-0 w-64 border-r border-border bg-surface flex flex-col z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <Hexagon className="text-white w-6 h-6 fill-white/20" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">RideHive</h1>
              <p className="text-[10px] text-muted uppercase font-bold tracking-widest leading-none mt-1">Admin Console</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-muted hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-secondary hover:text-error hover:bg-error/5 rounded-lg transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Logout Session</span>
        </button>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
