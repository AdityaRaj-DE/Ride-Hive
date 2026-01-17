import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RiderDashboard from './pages/RiderDashboard';
import DriverDashboard from './pages/DriverDashboard';
import RiderProfile from './pages/RiderProfile';
import DriverProfile from './pages/DriverProfile';

function ProtectedRoute({ children, requireDriver = false }: { children: React.ReactNode; requireDriver?: boolean }) {
  const { token, isDriver, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requireDriver && !isDriver) {
    return <Navigate to="/rider" />;
  }

  if (!requireDriver && isDriver) {
    return <Navigate to="/driver" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { token, isDriver } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={token ? <Navigate to={isDriver ? '/driver' : '/rider'} /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to={isDriver ? '/driver' : '/rider'} /> : <Register />} />
      <Route
        path="/rider"
        element={
          <ProtectedRoute requireDriver={false}>
            <RiderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rider/profile"
        element={
          <ProtectedRoute requireDriver={false}>
            <RiderProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver"
        element={
          <ProtectedRoute requireDriver={true}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/profile"
        element={
          <ProtectedRoute requireDriver={true}>
            <DriverProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
