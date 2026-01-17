import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface DriverProfileData {
  _id?: string;
  fullname?: {
    firstname: string;
    lastname?: string;
  };
  email?: string;
  mobileNumber?: string;
  licenseNumber?: string;
  vehicle?: {
    color: string;
    plate: string;
    capacity: number;
    vehicleType: 'car' | 'motorcycle' | 'auto';
  };
}

export default function DriverProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DriverProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.getCaptainProfile();
      setProfile(response.data.captain || response.data);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Driver Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/driver')}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Driver Information</h2>

          {profile ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 text-gray-900">{profile.fullname?.firstname || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 text-gray-900">{profile.fullname?.lastname || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{profile.email || user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <p className="mt-1 text-gray-900">{profile.mobileNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <p className="mt-1 text-gray-900">{profile.licenseNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              {profile.vehicle && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                      <p className="mt-1 text-gray-900 capitalize">{profile.vehicle.vehicleType || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vehicle Color</label>
                      <p className="mt-1 text-gray-900">{profile.vehicle.color || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">License Plate</label>
                      <p className="mt-1 text-gray-900">{profile.vehicle.plate || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity</label>
                      <p className="mt-1 text-gray-900">{profile.vehicle.capacity || 'N/A'} passengers</p>
                    </div>
                  </div>
                </div>
              )}

              {!profile.vehicle && (
                <div className="text-gray-500 italic">No vehicle information available</div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No profile data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

