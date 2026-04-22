import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Database, 
  Search, 
  RefreshCw, 
  Edit, 
  Trash2, 
  ChevronRight,
  Filter,
  Save,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLLECTIONS = [
  { id: 'users', name: 'Users (Auth Service)', service: 'auth' },
  { id: 'drivers', name: 'Drivers (Driver Service)', service: 'driver' },
  { id: 'rides', name: 'Rides (Ride Service)', service: 'ride' },
];

const DatabaseExplorer: React.FC = () => {
  const [activeCollection, setActiveCollection] = useState(COLLECTIONS[0]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editDoc, setEditDoc] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3009/admin/db/${activeCollection.id}`);
      setData(res.data);
    } catch (err) {
      toast.error(`Failed to load ${activeCollection.id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCollection]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3009/admin/db/${activeCollection.id}/${editDoc._id}`, editDoc);
      toast.success("Document updated successfully");
      setData(data.map(d => d._id === editDoc._id ? editDoc : d));
      setEditDoc(null);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold">Database Explorer</h2>
          <p className="text-muted text-sm">Directly browse and edit microservice collections.</p>
        </div>
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto">
          {COLLECTIONS.map(col => (
            <button
              key={col.id}
              onClick={() => setActiveCollection(col)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeCollection.id === col.id 
                ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                : 'bg-surface text-secondary hover:bg-white/5'
              }`}
            >
              {col.id.charAt(0).toUpperCase() + col.id.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card !p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder={`Search in ${activeCollection.id}...`}
              className="input-base w-full pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <button onClick={fetchData} className="btn-secondary h-10 w-10 !p-0">
               <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
             </button>
             <button className="btn-secondary gap-2">
               <Filter size={18} /> Filter
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs text-muted uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">ID / Metadata</th>
                <th className="px-6 py-4">Primary Content</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    Retrieving records from {activeCollection.service}_service...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    No records found.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-accent font-bold">#{item._id.slice(-8)}</span>
                        <span className="text-xs text-muted">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {activeCollection.id === 'users' && (
                          <div className="flex flex-col">
                            <p className="font-medium">{item.mobileNumber}</p>
                            <p className="text-xs text-muted">Roles: {Object.keys(item.roles || {}).filter(k => item.roles[k]).join(', ')}</p>
                          </div>
                        )}
                        {activeCollection.id === 'drivers' && (
                          <div className="flex flex-col">
                            <p className="font-medium">{item.fullname?.firstname} {item.fullname?.lastname}</p>
                            <p className="text-xs text-muted">{item.vehicleInfo?.model} ({item.vehicleInfo?.plateNumber})</p>
                          </div>
                        )}
                        {activeCollection.id === 'rides' && (
                          <div className="flex flex-col">
                            <p className="font-medium">₹{item.priceEstimate}</p>
                            <p className="text-xs text-muted">{item.rideType || 'Standard'} • {item.distance}m</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                         item.status === 'approved' || item.status === 'COMPLETED' ? 'bg-success/10 text-success' : 
                         item.status === 'pending_review' ? 'bg-accent/10 text-accent' :
                         'bg-muted/10 text-muted'
                       }`}>
                         {item.status || 'Active'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditDoc(item)}
                          className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-xl font-bold flex items-center gap-2">
                     <Database className="text-accent" />
                     Edit Document
                   </h3>
                   <p className="text-xs text-muted font-mono">{editDoc._id}</p>
                 </div>
                 <button onClick={() => setEditDoc(null)} className="btn-secondary h-10 w-10 !p-0 rounded-full">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto pr-2">
                 <div className="space-y-4">
                    {/* Simplified: Just JSON editor for now to keep it generic */}
                    <p className="text-xs text-muted mb-2">Manual JSON Override:</p>
                    <textarea 
                      className="w-full h-96 font-mono text-xs bg-black/40 border border-border rounded-xl p-4 outline-none focus:border-accent resize-none"
                      value={JSON.stringify(editDoc, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setEditDoc(parsed);
                        } catch (err) {
                           // Invalid JSON, don't update state yet
                        }
                      }}
                    />
                 </div>
              </form>

              <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-border">
                 <button onClick={() => setEditDoc(null)} className="btn-secondary">Cancel</button>
                 <button onClick={handleUpdate} className="btn-primary gap-2">
                   <Save size={18} /> Save Changes
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseExplorer;
