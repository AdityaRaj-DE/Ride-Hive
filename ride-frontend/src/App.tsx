import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token } = useSelector((s: RootState) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireOnboarding({ children }: { children: JSX.Element }) {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user) return <div>Loading...</div>;

  if (!user.onboarding?.rider) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function RequireNotOnboarded({ children }: { children: JSX.Element }) {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user) return null;

  if (user.onboarding?.rider) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
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
    <BrowserRouter>
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

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <Dashboard />
              </RequireOnboarding>
            </RequireAuth>
          }
        />

        {/* Book Ride */}
        <Route
          path="/book-ride"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <BookRide />
              </RequireOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/map-picker"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <MapPicker />
              </RequireOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/ride"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <RideFlow />
              </RequireOnboarding>
            </RequireAuth>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}