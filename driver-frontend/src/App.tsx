import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DriverOnboarding from "./pages/DriverOnboarding";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/WalletPage";
import type { RootState } from "./store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectDriverSocket } from "./sockets/socketClient";
import { initDriverRideListeners } from "./sockets/driverRideSocket";
import { fetchMe } from "./store/slices/authSlice";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token } = useSelector((s: RootState) => s.auth);
  if (!token) return <Navigate to="/driver/login" replace />;
  return children;
}

function RequireDriverOnboarded({ children }: { children: JSX.Element }) {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user) return null;

  if (!user.onboarding?.driver) {
    return <Navigate to="/driver/onboarding" replace />;
  }

  return children;
}

function RequireNotDriverOnboarded({ children }: { children: JSX.Element }) {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user) return null;

  if (user.onboarding?.driver) {
    return <Navigate to="/driver/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const dispatch = useDispatch();
const { token, user } = useSelector((s: RootState) => s.auth);

useEffect(() => {
  if (token && !user) {
    dispatch(fetchMe());
  }
}, [token]);

useEffect(() => {
  if (token && user) {
    const socket = connectDriverSocket(token);
    initDriverRideListeners(socket);
  }
}, [token, user]);

  return (
    <Routes>
      {/* Login */}
      <Route path="/driver/login" element={<Login />} />

      {/* Onboarding */}
      <Route
        path="/driver/onboarding/*"
        element={
          <RequireAuth>
            <RequireNotDriverOnboarded>
              <DriverOnboarding />
            </RequireNotDriverOnboarded>
          </RequireAuth>
        }
      />

      {/* Dashboard */}
      <Route
        path="/driver/dashboard"
        element={
          <RequireAuth>
            <RequireDriverOnboarded>
              <Dashboard />
            </RequireDriverOnboarded>
          </RequireAuth>
        }
      />

      <Route
        path="/driver/wallet"
        element={
          <RequireAuth>
            <RequireDriverOnboarded>
              <WalletPage />
            </RequireDriverOnboarded>
          </RequireAuth>
        }
      />

      <Route
        path="/driver/profile"
        element={
          <RequireAuth>
            <RequireDriverOnboarded>
             
            </RequireDriverOnboarded>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/driver/login" />} />
    </Routes>
  );
}
