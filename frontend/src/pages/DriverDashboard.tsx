import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { driverAPI, rideAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

type BroadcastRide = {
  rideId: string;
  pickup: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  distanceKm?: number;
  durationMin?: number;
  fare?: number;
};

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rideQueue, setRideQueue] = useState<BroadcastRide[]>([]);
  const [acceptedRideId, setAcceptedRideId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();

    // Connect to Ride Service Socket.IO directly
    const s = io('http://localhost:3004', { transports: ['websocket'] });
    setSocket(s);

    s.on('connect', () => {
      // connected
    });

    s.on('ride_broadcast', (data: BroadcastRide) => {
      setRideQueue((prev) => [data, ...prev]);
    });

    s.on('ride_accepted', (_data: any) => {
      // Could be used to notify
    });

    return () => {
      s.close();
    };
  }, []);

  const loadProfile = async () => {
    try {
      const response = await driverAPI.getProfile();
      setProfile(response.data);
      setAvailable(response.data?.available || false);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleToggleAvailability = async () => {
    setLoading(true);
    setError('');

    try {
      await driverAPI.updateAvailability(!available);
      setAvailable(!available);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    if (!user) return;
    const driverId = (user as any).id || (user as any)._id;
    if (!driverId) {
      setError('Missing driver id');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await rideAPI.acceptRide(rideId, driverId);
      setAcceptedRideId(rideId);
      // remove from queue
      setRideQueue((prev) => prev.filter((r) => r.rideId !== rideId));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to accept ride');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!acceptedRideId) return;
    setLoading(true);
    setError('');
    try {
      await rideAPI.completeRide(acceptedRideId);
      setAcceptedRideId(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to complete ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Driver Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.fullname?.firstname || user?.email}</span>
              <button
                onClick={() => navigate('/driver/profile')}
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                View Profile
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Driver Profile */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Driver Profile</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {profile && (
              <div className="space-y-2">
                <p><strong>Email:</strong> {profile.email || user?.email}</p>
                {profile.vehicle && (
                  <>
                    <p><strong>Vehicle Type:</strong> {profile.vehicle.vehicleType}</p>
                    <p><strong>Vehicle Color:</strong> {profile.vehicle.color}</p>
                    <p><strong>Vehicle Plate:</strong> {profile.vehicle.plate}</p>
                    <p><strong>Capacity:</strong> {profile.vehicle.capacity}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Availability Control */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Availability</h2>

            <div className="mb-4">
              <p className="text-gray-700 mb-4">
                Current Status: <span className={`font-bold ${available ? 'text-green-600' : 'text-red-600'}`}>
                  {available ? 'Available' : 'Not Available'}
                </span>
              </p>
            </div>

            <button
              onClick={handleToggleAvailability}
              disabled={loading}
              className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 ${
                available
                  ? 'bg-red-500 hover:bg-red-700 text-white'
                  : 'bg-green-500 hover:bg-green-700 text-white'
              }`}
            >
              {loading
                ? 'Updating...'
                : available
                ? 'Go Offline'
                : 'Go Online'}
            </button>

            <div className="mt-6 p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-700">
                {available
                  ? 'You are now available to accept ride requests. You will be notified when a ride is requested.'
                  : 'You are currently offline. Toggle to go online and start accepting rides.'}
              </p>
            </div>
          </div>

          {/* Incoming Ride Requests */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Incoming Ride Requests</h2>
            {acceptedRideId && (
              <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-green-700 font-semibold">Accepted Ride: {acceptedRideId}</span>
                  <button
                    onClick={handleCompleteRide}
                    disabled={loading}
                    className="ml-4 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    {loading ? 'Completing...' : 'Complete Ride'}
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rideQueue.length === 0 ? (
                <p className="text-gray-500">No incoming requests yet.</p>
              ) : (
                rideQueue.map((r) => (
                  <div key={r.rideId} className="border rounded p-3">
                    <div className="text-sm text-gray-700">
                      <p><strong>From:</strong> {r.pickup.address || `${r.pickup.lat}, ${r.pickup.lng}`}</p>
                      <p><strong>To:</strong> {r.destination.address || `${r.destination.lat}, ${r.destination.lng}`}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        {r.distanceKm != null && <span>Distance: {r.distanceKm} km</span>}
                        {r.durationMin != null && <span className="ml-3">ETA: {r.durationMin} min</span>}
                        {r.fare != null && <span className="ml-3">Fare: ₹{r.fare}</span>}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleAcceptRide(r.rideId)}
                        disabled={loading || !!acceptedRideId}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                      >
                        {loading ? 'Accepting...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

