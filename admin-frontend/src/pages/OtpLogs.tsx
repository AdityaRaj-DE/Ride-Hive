import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Search, 
  Trash2, 
  Pause, 
  Play, 
  Circle,
  Clock,
  Smartphone,
  Server
} from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../api/axios';

const OtpLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/otps');
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs");
      }
    };
    fetchLogs();

    // Socket connection
    const socket = io('http://localhost:3009');
    
    socket.on('otp.new', (newLog) => {
      if (!isPaused) {
        setLogs(prev => [newLog, ...prev].slice(0, 500));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isPaused]);

  const filteredLogs = logs.filter(log => 
    log.target?.includes(filter) || 
    log.code?.includes(filter) ||
    log.service?.includes(filter)
  );

  return (
    <div className="space-y-8 h-[calc(100vh-160px)] flex flex-col">
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h2 className="text-3xl font-display font-bold">Real-time OTP Monitor</h2>
          <p className="text-muted">Live console for platform-wide security tokens and events.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsPaused(!isPaused)}
             className={`btn-secondary gap-2 ${isPaused ? 'bg-warning/10 text-warning' : ''}`}
           >
             {isPaused ? <Play size={18} /> : <Pause size={18} />}
             {isPaused ? 'Resume' : 'Pause Stream'}
           </button>
           <button 
             onClick={() => setLogs([])}
             className="btn-secondary text-error gap-2"
           >
             <Trash2 size={18} /> Clear
           </button>
        </div>
      </div>

      <div className="glass-card flex-1 flex flex-col !p-0 overflow-hidden font-mono text-sm">
        <div className="p-4 border-b border-border bg-black/20 flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-success">
            <Circle size={10} className="fill-success animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Live Stream</span>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Filter by mobile, code or service..."
              className="bg-black/40 border border-border px-3 py-1.5 pl-9 rounded-lg w-full text-xs outline-none focus:border-accent transition-colors"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/40" ref={scrollRef}>
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted opacity-30 italic">
               <Terminal size={48} className="mb-4" />
               Awaiting platform events...
            </div>
          ) : (
            filteredLogs.map((log, i) => (
              <div 
                key={i} 
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <div className="text-muted whitespace-nowrap pt-0.5">
                   {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                </div>
                
                <div className="flex-1 flex gap-6">
                   <div className="flex items-center gap-2 min-w-[140px]">
                      <Smartphone size={14} className="text-accent" />
                      <span className="font-bold">{log.target}</span>
                   </div>
                   
                   <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="px-2 py-0.5 bg-accent/20 text-accent font-bold rounded border border-accent/20">
                         {log.code}
                      </div>
                   </div>

                   <div className="flex items-center gap-2 text-muted italic">
                      <Server size={14} />
                      <span>{log.service}</span>
                   </div>

                   <div className="flex-1 text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        log.type === 'LOGIN' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                      }`}>
                        {log.type || 'AUTH'}
                      </span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-2 px-4 bg-black/20 border-t border-border flex justify-between text-[10px] text-muted font-bold uppercase tracking-widest">
           <span>Connected to admin_service:socket</span>
           <span>Buffer: {logs.length}/500 logs</span>
        </div>
      </div>
    </div>
  );
};

export default OtpLogs;
