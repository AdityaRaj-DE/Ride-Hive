import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // API Gateway URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // User auth
  registerUser: (data: { fullname: { firstname: string; lastname?: string }; email: string; password: string }) =>
    api.post('/auth/users/register', data),
  
  loginUser: (data: { email: string; password: string }) =>
    api.post('/auth/users/login', data),
  
  getUserProfile: () =>
    api.get('/auth/users/profile'),
  
  logoutUser: () =>
    api.get('/auth/users/logout'),

  // Captain/Driver auth
  registerCaptain: (data: { 
    fullname: { firstname: string; lastname?: string }; 
    email: string; 
    password: string;
    mobileNumber: string;
    licenseNumber: string;
    vehicle: {
      color: string;
      plate: string;
      capacity: number;
      vehicleType: 'car' | 'motorcycle' | 'auto';
    };
  }) =>
    api.post('/auth/drivers/register', data),
  
  loginCaptain: (data: { email: string; password: string }) =>
    api.post('/auth/drivers/login', data),
  
  getCaptainProfile: () =>
    api.get('/auth/drivers/profile'),
  
  logoutCaptain: () =>
    api.get('/auth/drivers/logout'),
};

// Rider API
export const riderAPI = {
  createOrUpdateProfile: (data: any) =>
    api.post('/rider/profile', data),
  
  getProfile: () =>
    api.get('/rider/profile'),
  
  createRideRequest: (data: { pickup: { lat: number; lng: number; address: string }; drop: { lat: number; lng: number; address: string }; fareEstimate?: number }) =>
    api.post('/rider/request', data),
  
  getMyRides: () =>
    api.get('/rider/myrides'),
};

// Driver API
export const driverAPI = {
  register: (data: any) =>
    api.post('/driver/register', data),
  
  getProfile: () =>
    api.get('/driver/profile'),
  
  updateAvailability: (available: boolean) =>
    api.put('/driver/availability', { available }),
};

// Ride API (through API Gateway -> ride_service mounted at /rides)
export const rideAPI = {
  // Rider creates a ride request
  requestRide: (data: { riderId: string; pickup: any; destination: any }) =>
    api.post('/ride/rides/request', data),

  // Fetch a ride by id
  getRide: (rideId: string) => api.get(`/ride/rides/${rideId}`),

  // Driver accepts a ride
  acceptRide: (rideId: string, driverId: string) =>
    api.post(`/ride/rides/accept/${rideId}`, { driverId }),

  // Driver completes a ride
  completeRide: (
    rideId: string,
    data?: { distanceMeters?: number; durationSec?: number }
  ) => api.post(`/ride/rides/complete/${rideId}`, data || {}),
};

// Payment API
export const paymentAPI = {
  initiatePayment: (data: any) =>
    api.post('/payment/initiate', data),
  
  completePayment: (data: any) =>
    api.post('/payment/complete', data),
  
  getPaymentDetails: (rideId: string) =>
    api.get(`/payment/${rideId}`),
};

export default api;

