import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  Navigation,
  ShieldAlert,
  Search,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

interface SOSAlert {
  _id: string;
  rideId: string;
  userId: string;
  role: 'RIDER' | 'DRIVER';
  location: {
    lat: number;
    lng: number;
  };
  status: 'OPEN' | 'RESOLVED' | 'INVESTIGATING';
  createdAt: string;
  riderName?: string;
}

const SafetyHub: React.FC = () => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  useEffect(() => {
    fetchAlerts();
    // In a real app, we would listen to sockets here.
    // For now, we poll or rely on the manual refresh.
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/ride/sos/all');
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch SOS alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      await api.patch(`/ride/sos/${id}/resolve`);
      toast.success("Alert marked as resolved");
      fetchAlerts();
    } catch (err) {
      toast.error("Failed to resolve alert");
    }
  };

  const filteredAlerts = alerts.filter(a => filter === 'ALL' || a.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center text-error">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Safety Hub</h1>
              <p className="text-secondary text-sm font-medium">Real-time Emergency & SOS Monitoring</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-surface p-1.5 rounded-2xl border border-border">
          {(['ALL', 'OPEN', 'RESOLVED'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === type 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-muted hover:text-primary hover:bg-background'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="glass-card p-20 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Safe Handshake Level 7</h2>
              <p className="text-muted text-sm max-w-xs mx-auto">All clear. No active emergencies detected on the platform currently.</p>
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div 
              key={alert._id} 
              className={`glass-card overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                alert.status === 'OPEN' ? 'border-error/20 ring-1 ring-error/10' : 'opacity-80'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Status Indicator */}
                <div className={`lg:col-span-1 flex items-center justify-center ${
                  alert.status === 'OPEN' ? 'bg-error' : 'bg-success'
                }`}>
                  <AlertTriangle className="text-white w-6 h-6" />
                </div>

                <div className="lg:col-span-11 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                         <User className="w-6 h-6 text-muted" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg uppercase tracking-tight">{alert.role}: {alert.userId.slice(-6)}</h3>
                        <p className="text-xs text-muted font-medium flex items-center gap-1">
                          <Clock size={12} /> {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-accent">
                      <span className="px-3 py-1 bg-accent/10 rounded-lg">RIDE-ID: {alert.rideId.slice(-6)}</span>
                      <span className={`px-3 py-1 rounded-lg ${
                        alert.status === 'OPEN' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                      }`}>
                        STATUS: {alert.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-secondary">
                      <MapPin size={16} className="text-muted" />
                      <span className="text-sm font-semibold tracking-tight">Coordinates: {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}</span>
                    </div>
                    <button 
                      className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest hover:underline"
                      onClick={() => window.open(`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`, '_blank')}
                    >
                      <ExternalLink size={12} /> View on Global Map
                    </button>
                  </div>

                  <div className="flex justify-end gap-4">
                    {alert.status === 'OPEN' && (
                      <button 
                        onClick={() => resolveAlert(alert._id)}
                        className="h-14 px-8 bg-success text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-success/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        Mark as Resolved
                      </button>
                    )}
                    <button className="h-14 w-14 bg-surface border border-border rounded-xl flex items-center justify-center text-primary hover:bg-background transition-all">
                       <Navigation size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SafetyHub;
