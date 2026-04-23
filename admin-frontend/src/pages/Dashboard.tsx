import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Car, 
  MapPin, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../api/axios';

const data = [
  { name: 'Mon', rides: 400, revenue: 2400 },
  { name: 'Tue', rides: 300, revenue: 1398 },
  { name: 'Wed', rides: 200, revenue: 9800 },
  { name: 'Thu', rides: 278, revenue: 3908 },
  { name: 'Fri', rides: 189, revenue: 4800 },
  { name: 'Sat', rides: 239, revenue: 3800 },
  { name: 'Sun', rides: 349, revenue: 4300 },
];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="glass-card-elevated">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-muted text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
        <div className={`flex items-center gap-1 mt-2 text-sm ${change.startsWith('+') ? 'text-success' : 'text-error'}`}>
          {change.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{change} vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/analytics');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = stats?.trends && stats.trends.length > 0 ? stats.trends : [
    { name: 'Mon', rides: 0, revenue: 0 },
    { name: 'Tue', rides: 0, revenue: 0 },
    { name: 'Wed', rides: 0, revenue: 0 },
    { name: 'Thu', rides: 0, revenue: 0 },
    { name: 'Fri', rides: 0, revenue: 0 },
    { name: 'Sat', rides: 0, revenue: 0 },
    { name: 'Sun', rides: 0, revenue: 0 },
  ];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-display font-bold">Platform Overview</h2>
        <p className="text-muted text-sm">Real-time statistics and service health monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers?.toLocaleString() || "0"} change="+0%" icon={Users} color="accent" />
        <StatCard title="Active Drivers" value={stats?.activeDrivers?.toString() || "0"} change="+0%" icon={Car} color="success" />
        <StatCard title="Live Rides" value={stats?.liveRides?.toString() || "0"} change="+0%" icon={MapPin} color="accent" />
        <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || "0"}`} change="+0%" icon={TrendingUp} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Revenue & Activity Trends</h3>
            <div className="flex items-center gap-4 text-xs font-medium text-muted">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-accent opacity-30"></div>
                  <span>Daily Revenue</span>
               </div>
            </div>
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis 
                  stroke="var(--color-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E1E2E', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#FFF'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">System Alerts</h3>
            {stats?.pendingReviewCount > 0 && (
              <span className="bg-error/20 text-error text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                {stats.pendingReviewCount} Urgent
              </span>
            )}
          </div>
          <div className="space-y-4">
            {stats?.recentAlerts && stats.recentAlerts.length > 0 ? (
              stats.recentAlerts.map((alert: any) => (
                <div key={alert.id} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-error mt-2 shadow-[0_0_10px_rgba(255,107,107,0.5)]" />
                  <div>
                    <p className="text-sm font-bold text-primary group-hover:text-accent transition-colors">{alert.title}</p>
                    <p className="text-xs text-muted mt-1">{alert.message}</p>
                    <p className="text-[10px] text-muted mt-2 font-mono opacity-50 uppercase tracking-tighter">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-30">
                 <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted"></div>
                 <p className="text-xs font-medium">No pending critical alerts</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 text-accent text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity border-t border-white/5 pt-6">View All System Events</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
