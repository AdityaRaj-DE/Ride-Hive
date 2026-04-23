import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DriverOnboarding from "./pages/DriverOnboarding";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/WalletPage";
import RidePool from "./pages/RidePool";
import History from "./pages/History";
import RideDetail from "./pages/RideDetail";
import type { RootState, AppDispatch } from "./store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectDriverSocket } from "./sockets/socketClient";
import { initDriverRideListeners } from "./sockets/driverRideSocket";
import { fetchMe } from "./store/slices/authSlice";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./components/MainLayout";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useSelector((s: RootState) => s.auth);
  if (!token) return <Navigate to="/driver/login" replace />;
  return <>{children}</>;
}

import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Services from "./pages/Services";

function AuthenticatedLayout({ children, fullContent }: { children: React.ReactNode, fullContent?: boolean }) {
  return (
    <RequireAuth>
      <MainLayout fullContent={fullContent}>{children}</MainLayout>
    </RequireAuth>
  );
}

function RequireDriverOnboarded({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user) return <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>;

  if (!user.onboarding?.driver) {
    return <Navigate to="/driver/onboarding" replace />;
  }

  return <>{children}</>;
}

function RequireNotDriverOnboarded({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user) return null;

  if (user.onboarding?.driver) {
    return <Navigate to="/driver/dashboard" replace />;
  }

  return <>{children}</>;
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
      const socket = connectDriverSocket(token);
      initDriverRideListeners(socket);
    }
  }, [token, user]);

  return (
    <ThemeProvider>
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

        {/* Authenticated Routes wrapped in MainLayout */}
        <Route
          path="/driver/dashboard"
          element={
            <AuthenticatedLayout fullContent={true}>
              <RequireDriverOnboarded>
                <Dashboard />
              </RequireDriverOnboarded>
            </AuthenticatedLayout>
          }
        />

        <Route
          path="/driver/wallet"
          element={
            <AuthenticatedLayout>
              <RequireDriverOnboarded>
                <WalletPage />
              </RequireDriverOnboarded>
            </AuthenticatedLayout>
          }
        />

        <Route
          path="/driver/profile"
          element={
            <AuthenticatedLayout>
              <RequireDriverOnboarded>
                <Profile />
              </RequireDriverOnboarded>
            </AuthenticatedLayout>
          }
        />

        <Route
          path="/driver/profile/edit"
          element={
            <AuthenticatedLayout>
              <RequireDriverOnboarded>
                <ProfileEdit />
              </RequireDriverOnboarded>
            </AuthenticatedLayout>
          }
        />

        <Route
          path="/driver/services"
          element={
            <AuthenticatedLayout>
              <RequireDriverOnboarded>
                <Services />
              </RequireDriverOnboarded>
            </AuthenticatedLayout>
          }
        />

        {/* Ride Pool */}
        <Route
          path="/driver/ride-pool"
          element={
            <AuthenticatedLayout>
              <RequireDriverOnboarded>
                <RidePool />
              </RequireDriverOnboarded>
            </AuthenticatedLayout>
          }
        />

        <Route
          path="/driver/history"
          element={
            <AuthenticatedLayout>
              <RequireDriverOnboarded>
                <History />
              </RequireDriverOnboarded>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/driver/history/:id"
          element={
            <AuthenticatedLayout>
              <RequireDriverOnboarded>
                <RideDetail />
              </RequireDriverOnboarded>
            </AuthenticatedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/driver/login" />} />
      </Routes>
    </ThemeProvider>
  );
}


