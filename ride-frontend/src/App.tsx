import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RiderOnboarding from "./pages/RiderOnboarding";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import { useSelector } from "react-redux";
import type { RootState } from "./store";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token } = useSelector((s: RootState) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireOnboarding({ children }: { children: JSX.Element }) {
  const { user } = useSelector((s: RootState) => s.auth);

  // while /auth/me still loading
  if (!user) return null;

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

        {/* App */}
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

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <Profile />
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
