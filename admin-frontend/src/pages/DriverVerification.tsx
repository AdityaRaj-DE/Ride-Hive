import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  User, 
  Clock,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DriverVerification: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const fetchPendingDrivers = async () => {
    try {
      // Endpoint we created in admin_service which calls driver_service
      const res = await axios.get('http://localhost:3009/admin/drivers/pending');
      setDrivers(res.data);
    } catch (err) {
      toast.error("Failed to load pending drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await axios.post(`http://localhost:3009/admin/drivers/${userId}/approve`);
      toast.success("Driver approved successfully");
      setDrivers(drivers.filter(d => d.userId !== userId));
      setSelectedDriver(null);
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold">Driver Verification</h2>
        <p className="text-muted">Review and approve document submissions from new drivers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Driver List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card !p-0 overflow-hidden">
            <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Clock size={18} className="text-accent" />
                Pending Review
              </h3>
              <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-full">
                {drivers.length}
              </span>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-muted">Loading drivers...</div>
              ) : drivers.length === 0 ? (
                <div className="p-12 text-center text-muted">
                   <ShieldCheck size={40} className="mx-auto mb-3 opacity-20" />
                   No pending verifications
                </div>
              ) : (
                drivers.map((driver) => (
                  <button
                    key={driver._id}
                    onClick={() => setSelectedDriver(driver)}
                    className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-white/5 ${selectedDriver?._id === driver._id ? 'bg-accent/5 lg:border-r-4 border-r-accent' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
                        <User size={20} className="text-secondary" />
                      </div>
                      <div>
                        <p className="font-bold">{driver.fullname.firstname} {driver.fullname.lastname}</p>
                        <p className="text-xs text-muted">License: {driver.licenseNumber}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Details Area */}
        <div className="lg:col-span-2">
          {selectedDriver ? (
            <div className="glass-card space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <img 
                       src={selectedDriver.documents?.profilePhoto?.url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100"} 
                       className="w-20 h-20 rounded-2xl object-cover border border-border"
                       alt="Profile"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">{selectedDriver.fullname.firstname} {selectedDriver.fullname.lastname}</h3>
                      <p className="text-muted flex items-center gap-1">
                        <User size={14} />
                        User ID: {selectedDriver.userId}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(selectedDriver.userId)}
                      className="btn-primary gap-2"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button className="btn-secondary text-error hover:bg-error/10 hover:text-error gap-2 border-error/20">
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-border">
                    <p className="text-xs text-muted uppercase font-bold tracking-wider mb-2">Vehicle Information</p>
                    <p className="font-medium">{selectedDriver.vehicleInfo?.model}</p>
                    <p className="text-sm text-secondary">{selectedDriver.vehicleInfo?.plateNumber} • {selectedDriver.vehicleInfo?.color}</p>
                    <p className="text-sm text-accent mt-1">{selectedDriver.vehicleInfo?.type}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-border">
                    <p className="text-xs text-muted uppercase font-bold tracking-wider mb-2">Registration Date</p>
                    <p className="font-medium">{new Date(selectedDriver.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-secondary">Awaiting manual approval</p>
                  </div>
               </div>

               <div>
                 <h4 className="font-bold flex items-center gap-2 mb-4">
                   <FileText size={18} className="text-accent" />
                   Submitted Documents
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Driving License', url: selectedDriver.documents?.drivingLicense?.url },
                      { name: 'RC Book', url: selectedDriver.documents?.rcBook?.url },
                      { name: 'Insurance Policy', url: selectedDriver.documents?.insurance?.url },
                      { name: 'Profile Photo', url: selectedDriver.documents?.profilePhoto?.url },
                    ].map((doc) => (
                      <div key={doc.name} className="group relative rounded-xl overflow-hidden border border-border aspect-video bg-surface">
                         <img 
                           src={doc.url || "https://images.unsplash.com/photo-1613243555988-441166d4d6fd?auto=format&fit=crop&q=80&w=300&h=200"} 
                           className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                           alt={doc.name}
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                            <p className="text-white font-bold text-sm">{doc.name}</p>
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-accent-light font-medium mt-1 flex items-center gap-1 hover:underline"
                            >
                              <Eye size={12} /> View Full Detail
                            </a>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted glass-card border-dashed">
               <ShieldCheck size={48} className="mb-4 opacity-10" />
               <p>Select a driver from the list to begin verification</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverVerification;
