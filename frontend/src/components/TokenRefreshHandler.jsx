import React, { useEffect } from "react";
import { SessionManager } from "../utils/SessionManager";

/**
 * Simple token refresh mechanism to extend session during active use
 * This can be used in App.js or a central component
 */
const TokenRefreshHandler = ({ children }) => {
  // Refresh token expiration every 30 minutes of active use
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (SessionManager.isAuthenticated()) {
        SessionManager.refreshTokenExpiration();
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  return <>{children}</>;
};

export default TokenRefreshHandler;