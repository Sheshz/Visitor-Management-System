import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/Register";
import HostDashboard from "./components/HostDashboard";
import CreateHostProfile from "./components/hosts/CreateHostProfile";
import UserDashboard from "./components/UserDashboard";
import HostLogin from "./components/hosts/HostLogin";
import HostProfile from "./pages/HostProfile";
import ExpertsPage from "./pages/ExpertsPage";
import AboutUsPage from "./pages/AboutUsPage";
import ApplyHostPage from "./components/hosts/ApplyHostPage";
import ProfilePage from "./pages/ProfilePage";
import SessionManager from "./components/SessionManager";
import NotFound from "./components/NotFound";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    // Redirect to login if no token exists
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      {/* SessionManager handles token validation and inactivity logout */}
      <SessionManager />
      
      <Routes>
        {/* Define all the routes in the application */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/host-dashboard" element={
          <ProtectedRoute>
            <HostDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/create-host" element={
          <ProtectedRoute>
            <CreateHostProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/host-login" element={<HostLogin />} />
        <Route path="/experts" element={<ExpertsPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/apply-host" element={<ApplyHostPage />} />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/host-profile" element={
          <ProtectedRoute>
            <HostProfile />
          </ProtectedRoute>
        } />
        
        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;