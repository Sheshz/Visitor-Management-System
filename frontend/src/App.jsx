import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/Register";
import HostDashboard from "./components/HostDashboard";
import UserDashboard from "./components/UserDashboard";
import HostLogin from "./components/hosts/HostLogin";
import HostProfile from "./pages/HostProfile";
import ExpertsPage from "./pages/ExpertsPage";
import AboutUsPage from "./pages/AboutUsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./components/NotFound";
import TokenWarningModal from "./components/common/TokenWarningModal";
import { UserService } from "./services/UserService";
import HostRegistrationFlow from "./components/hosts/HostRegistrationFlow";
import TokenRefreshHandler from "./components/TokenRefreshHandler";
import ProtectedRoute from "./components/ProtectedRoute";

// Protected route component - moved to its own file (ProtectedRoute.js)
// This is now imported from "./components/ProtectedRoute" above

function App() {
  const userService = new UserService();

  const handleRefreshToken = () => {
    userService.refreshAccessToken();
  };

  const handleLogout = () => {
    userService.logout();
  };

  return (
    <Router>
      <TokenRefreshHandler>
        <Routes>
          {/* Define all the routes in the application */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/host-login" element={<HostLogin />} />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/host-dashboard"
            element={
              <ProtectedRoute>
                <HostDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/host-login" element={<HostLogin />} />
          <Route path="/experts" element={<ExpertsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/host/register" element={<HostRegistrationFlow />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/host-profile"
            element={
              <ProtectedRoute>
                <HostProfile />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <TokenWarningModal
          warningThreshold={60}
          onRefresh={handleRefreshToken}
          onLogout={handleLogout}
        />
      </TokenRefreshHandler>
    </Router>
  );
}

export default App;
