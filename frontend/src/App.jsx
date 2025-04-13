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
import ExpertsPage from "./pages/ExpertsPage";
import AboutUsPage from "./pages/AboutUsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./components/NotFound";
import TokenWarningModal from "./components/common/TokenWarningModal";
import { UserService } from "./services/UserService";
import HostRegistrationFlow from "./components/hosts/HostRegistrationFlow";
import TokenRefreshHandler from "./components/TokenRefreshHandler";
import ProtectedRoute from "./components/ProtectedRoute";
import LogoutHandler from "./components/LogoutHandler";
import HostProfile from "./components/hosts/HostProfile";
import ViewHostProfile from "./components/hosts/ViewHostProfile";

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
        {/* Uncomment this to debug current path */}
        {/* <div style={{ padding: "10px", background: "#eee", fontSize: "12px" }}>
          Current Path: {window.location.pathname}
        </div> */}
        
        <Routes>
          {/* Home route */}
          <Route path="/" element={<Home />} />
          
          {/* User authentication routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Specific host routes */}
          <Route path="/host-login" element={<HostLogin />} />
          <Route path="/become-host" element={<HostRegistrationFlow />} />
          <Route path="/host/register" element={<HostRegistrationFlow />} />



          {/* Logout routes */}
          <Route 
            path="/logout" 
            element={<LogoutHandler redirectTo="/login" />} 
          />
          <Route 
            path="/host-logout" 
            element={<LogoutHandler redirectTo="/host-login" />} 
          />

          {/* Protected user routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected host routes - require host authentication */}
          <Route
            path="/host-dashboard/*"
            element={
              <ProtectedRoute requireHost={true}>
                <HostDashboard />
              </ProtectedRoute>
            }
          />


          {/* Other public routes */}
          <Route path="/experts" element={<ExpertsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          
          {/* Protected user profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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