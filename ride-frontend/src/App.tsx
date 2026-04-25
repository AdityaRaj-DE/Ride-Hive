import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import RiderOnboarding from "./pages/RiderOnboarding";
import Dashboard from "./pages/Dashboard";
import BookRide from "./pages/BookRide";

import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { fetchMe } from "./store/authSlice";
import { connectSocket } from "./sockets/socketClient";
import { initRideSocketListeners } from "./sockets/rideSocket";
import MapPicker from "./pages/MapPicker";
import RideFlow from "./pages/RideFlow";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./components/MainLayout";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useSelector((s: RootState) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import RideHistory from "./pages/RideHistory";
import RideDetail from "./pages/RideDetail";
import Services from "./pages/Services";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <MainLayout>{children}</MainLayout>
    </RequireAuth>
  );
}

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user) return <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
  </div>;

  if (!user.onboarding?.rider) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function RequireNotOnboarded({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user) return null;

  if (user.onboarding?.rider) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function RideRedirector() {
  const navigate = useNavigate();
  const ride = useSelector((s: RootState) => s.ride);
  
  useEffect(() => {
    if (ride.rideId && ride.status) {
       const activeStatuses = ["DRIVER_ASSIGNED", "DRIVER_ARRIVING", "IN_PROGRESS", "COMPLETED"];
       if (activeStatuses.includes(ride.status)) {
          const currentPath = window.location.pathname;
          if (currentPath !== "/ride") {
             navigate("/ride");
          }
       }
    }
  }, [ride.rideId, ride.status, navigate]);

  return null;
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    if (token && user) {
      const socket = connectSocket(token);
      initRideSocketListeners(socket);
    }
  }, [token, user]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <RideRedirector />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <RequireNotOnboarded>
                  <RiderOnboarding />
                </RequireNotOnboarded>
              </RequireAuth>
            }
          />

          {/* Authenticated Routes wrapped in MainLayout */}
          <Route
            path="/dashboard"
            element={
              <AuthenticatedLayout>
                <RequireOnboarding>
                  <Dashboard />
                </RequireOnboarding>
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/book-ride"
            element={
              <AuthenticatedLayout>
                <RequireOnboarding>
                  <BookRide />
                </RequireOnboarding>
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/map-picker"
            element={
              <AuthenticatedLayout>
                <RequireOnboarding>
                  <MapPicker />
                </RequireOnboarding>
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/ride"
            element={
              <AuthenticatedLayout>
                <RequireOnboarding>
                  <RideFlow />
                </RequireOnboarding>
              </AuthenticatedLayout>
            }
          />

          {/* New Routes */}
          <Route
            path="/profile"
            element={
              <AuthenticatedLayout>
                <RequireOnboarding>
                  <Profile />
                </RequireOnboarding>
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <AuthenticatedLayout>
                <RequireOnboarding>
                  <ProfileEdit />
                </RequireOnboarding>
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/history"
            element={
              <AuthenticatedLayout>
                <RequireOnboarding>
                  <RideHistory />
                </RequireOnboarding>
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/history/:id"
            element={
              <AuthenticatedLayout>
                <RequireOnboarding>
                  <RideDetail />
                </RequireOnboarding>
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/services"
            element={
              <AuthenticatedLayout>
                <RequireOnboarding>
                  <Services />
                </RequireOnboarding>
              </AuthenticatedLayout>
            }
          />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
