import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { User, Mail, Phone, ArrowLeft, Check, Camera, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((s: RootState) => s.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/rider/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.rider) {
          setFormData({
            firstName: data.rider.name?.first || '',
            lastName: data.rider.name?.last || '',
            email: data.rider.email || '',
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile for editing:", err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch("http://localhost:3000/rider/profile", {
        name: { first: formData.firstName, last: formData.lastName },
        email: formData.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/profile');
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen text-primary pb-24">
      <div className="max-w-2xl mx-auto px-6 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-primary hover:bg-background transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mt-1">Secure Personal Details</p>
          </div>
        </header>

        <div className="relative w-36 h-36 mx-auto mb-16 group">
          <div className="w-full h-full bg-surface rounded-[2.5rem] flex items-center justify-center border border-border shadow-xl group-hover:scale-105 transition-all duration-500 overflow-hidden relative">
            <span className="text-accent text-6xl font-bold uppercase">
              {(formData.firstName.charAt(0)) || 'U'}
            </span>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer">
               <Camera className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-accent text-white border-4 border-white shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass-card p-8 md:p-10 border-accent/10 shadow-xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  First Name
                </label>
                <input 
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-6 py-4 bg-surface border border-border rounded-xl font-semibold text-lg text-primary focus:border-accent/40 outline-none transition-all placeholder:text-muted/20"
                  placeholder="e.g. John"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Last Name
                </label>
                <input 
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-6 py-4 bg-surface border border-border rounded-xl font-semibold text-lg text-primary focus:border-accent/40 outline-none transition-all placeholder:text-muted/20"
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Email Address
              </label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-6 py-4 bg-surface border border-border rounded-xl font-semibold text-lg text-primary focus:border-accent/40 outline-none transition-all placeholder:text-muted/20 font-mono"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-3 opacity-60">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                Mobile Number (Verified)
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={(user as any).mobile || (user as any).phone || ''}
                  disabled
                  className="w-full px-6 py-4 bg-surface border border-border rounded-xl font-semibold text-lg text-primary cursor-not-allowed italic"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                   <ShieldCheck className="w-4 h-4 text-accent" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              type="submit"
              disabled={loading}
              className={`btn-primary w-full h-16 text-lg gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Check className="w-6 h-6" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <p className="text-[9px] font-bold text-center text-muted uppercase tracking-widest opacity-40">
               Protected by Enterprise-Grade Security
            </p>
          </div>
        </form>
      </div>
      
      <footer className="mt-20 text-center opacity-20 w-full px-6 pb-12">
         <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Hive Mobility • Secure Profile Update</p>
      </footer>
    </div>
  );
};

export default ProfileEdit;
