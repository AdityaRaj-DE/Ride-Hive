import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { rideAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// minimal rider-side types handled via socket events

export default function RiderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState({ address: '', lat: 0, lng: 0 });
  const [drop, setDrop] = useState({ address: '', lat: 0, lng: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  // local socket connection (no need to store if not used elsewhere)
  const [rideAcceptedInfo, setRideAcceptedInfo] = useState<any>(null);

  useEffect(() => {
    const s = io('http://localhost:3004', { transports: ['websocket'] });
    s.on('ride_accepted', (data) => {
      if (data?.rideId && data.rideId === activeRideId) {
        setRideAcceptedInfo(data);
        setSuccess('Driver accepted your ride!');
        setTimeout(() => setSuccess(''), 3000);
      }
    });
    return () => { s.close(); };
  }, [activeRideId]);

  const handleRequestRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pickup.address || !drop.address) {
      setError('Please enter both pickup and drop locations');
      return;
    }

    setLoading(true);

    try {
      const riderId = (user as any)?.id || (user as any)?._id;
      if (!riderId) throw new Error('Missing rider id');

      const response = await rideAPI.requestRide({
        riderId,
        pickup: {
          address: pickup.address,
          lat: pickup.lat || 28.6139,
          lng: pickup.lng || 77.209,
        },
        destination: {
          address: drop.address,
          lat: drop.lat || 28.5355,
          lng: drop.lng || 77.391,
        },
      });

      const newRideId = response.data?.rideId;
      setActiveRideId(newRideId || null);
      setPickup({ address: '', lat: 0, lng: 0 });
      setDrop({ address: '', lat: 0, lng: 0 });
      setSuccess('Ride requested! Waiting for a driver to accept...');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create ride request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // history view omitted in this minimal flow

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Ride Sharing App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.fullname?.firstname || user?.email}</span>
              <button
                onClick={() => navigate('/rider/profile')}
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
        {/* Active Ride Banner */}
        {activeRideId && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Active Ride</h3>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {rideAcceptedInfo ? 'Driver accepted' : 'Searching for driver...'}</p>
                  {rideAcceptedInfo && (
                    <div className="text-sm text-gray-700">
                      <p><strong>Driver:</strong> {rideAcceptedInfo?.driver?.name || rideAcceptedInfo?.driver?.email || 'Assigned'}</p>
                      {rideAcceptedInfo?.fare != null && (
                        <p><strong>Fare:</strong> ₹{rideAcceptedInfo.fare}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Ride Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Book a Ride</h2>

            <form onSubmit={handleRequestRide}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={pickup.address}
                  onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                  placeholder="Enter pickup address"
                  required
                  disabled={!!activeRideId}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Drop Location
                </label>
                <input
                  type="text"
                  value={drop.address}
                  onChange={(e) => setDrop({ ...drop, address: e.target.value })}
                  placeholder="Enter drop address"
                  required
                  disabled={!!activeRideId}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !!activeRideId}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Requesting Ride...' : activeRideId ? 'You have an active ride' : 'Book Ride'}
              </button>

              {activeRideId && (
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Please complete or cancel your current ride to book a new one.
                </p>
              )}
            </form>
          </div>
          {/* Placeholder for ride history (requires backend endpoints) */}
        </div>
      </div>
    </div>
  );
}
