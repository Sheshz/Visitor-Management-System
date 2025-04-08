import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SessionManager } from "../utils/SessionManager";

/**
 * Protected Route component to handle authentication checks
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components to render when authenticated
 * @param {boolean} props.requireHost Whether the route requires host authentication
 */
const ProtectedRoute = ({ children, requireHost = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // First try to transfer from localStorage if needed
        SessionManager.transferFromLocalStorage();
        
        // Then check appropriate authentication based on route requirements
        let isAuth = false;
        
        if (requireHost) {
          // Check if host is authenticated
          isAuth = SessionManager.isHostAuthenticated();
          if (!isAuth) {
            console.log("Host authentication required but not found, redirecting to host login");
            navigate('/host-login?force=true', { 
              replace: true,
              state: { from: location.pathname }
            });
            return;
          }
        } else {
          // Check if either user or host is authenticated
          isAuth = SessionManager.isUserAuthenticated() || SessionManager.isHostAuthenticated();
          if (!isAuth) {
            console.log("Authentication required but not found, redirecting to login");
            navigate('/login', { 
              replace: true,
              state: { from: location.pathname }
            });
            return;
          }
        }
        
        // If we reach here, authentication is successful
        console.log(`Authentication successful as ${SessionManager.getUserRole()}`);
        
        // Refresh token expiration
        SessionManager.refreshTokenExpiration();
        setAuthChecked(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate(requireHost ? '/host-login?error=true' : '/login', { 
          replace: true,
          state: { error: "Authentication error, please login again" }
        });
      }
    };
    
    checkAuthentication();
  }, [navigate, location, requireHost]); 
  
  // Show loading indicator while checking auth
  if (!authChecked) {
    return (
      <div className="auth-checking" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Verifying your credentials...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;