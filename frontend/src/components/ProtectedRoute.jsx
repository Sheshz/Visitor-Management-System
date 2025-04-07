import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionManager } from "../utils/SessionManager";

/**
 * Protected Route component to handle authentication checks
 */
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // First try to transfer from localStorage if needed
    SessionManager.transferFromLocalStorage();
    
    // Then check if authenticated
    if (!SessionManager.isAuthenticated()) {
      navigate('/login', { replace: true });
    } else {
      // User is authenticated, refresh token expiration
      SessionManager.refreshTokenExpiration();
      setAuthChecked(true);
    }
  }, []); // No dependencies to avoid loops
  
  // Only render children after auth check completes and user is authenticated
  return authChecked ? children : null;
};

export default ProtectedRoute;