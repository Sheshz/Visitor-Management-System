import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * SessionManager component that handles:
 * - Token validation and expiration
 * - User inactivity tracking
 * - Custom auth events
 * - Route protection
 * - Redirect preservation
 */
const SessionManager = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Simple token decoding function using atob
  const isTokenExpired = (token) => {
    try {
      // First check if token exists and has the expected format
      if (!token || !token.includes(".")) {
        console.warn("Invalid token format");
        return true;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));

      // Check if payload has expiration time
      if (!payload || typeof payload.exp !== "number") {
        console.warn("Token doesn't have valid expiration data");
        return true;
      }

      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error parsing token:", error);
      return true;
    }
  };

  // Public routes configuration
  const publicRoutes = [
    "/login",
    "/register",
    "/",
    "/about",
    "/contact",
    "/help",
  ];
  
  // More flexible approach for public route checking
  const isPublicRoute = (path) => {
    const publicPaths = ["/login", "/register", "/"];
    const publicPrefixes = ["/public/", "/help/"];

    return (
      publicPaths.includes(path) ||
      publicPrefixes.some((prefix) => path.startsWith(prefix))
    );
  };

  const saveCurrentPathForRedirect = () => {
    const currentPath = location.pathname;
    if (!publicRoutes.includes(currentPath) && !isPublicRoute(currentPath)) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
  };

  const logoutUser = (reason = "session_expired") => {
    console.log(`Logging out user due to: ${reason}`);
    
    // Save current path for potential redirect after login
    saveCurrentPathForRedirect();
    
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    
    // Navigate to login with reason parameter
    navigate(`/login?expired=true&reason=${encodeURIComponent(reason)}`, {
      replace: true,
    });
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    const currentPath = location.pathname;

    if (!token) {
      // Check if current route is not a public route
      if (!publicRoutes.includes(currentPath) && !isPublicRoute(currentPath)) {
        saveCurrentPathForRedirect();
        navigate("/login", { replace: true });
      }
      return;
    }

    if (isTokenExpired(token)) {
      console.log("Token expired, logging out user");
      logoutUser("expired_token");
    }
  };

  useEffect(() => {
    // Check token immediately
    checkTokenExpiration();

    // For inactivity tracking
    let inactivityTimeout;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => logoutUser("inactivity"), 3600000); // 1 hour

    };

    // Set up event listeners for activity tracking
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);

    // Start inactivity timer
    resetInactivityTimer();

    // Regularly check token expiration
    //const expirationCheckInterval = setInterval(checkTokenExpiration, 60000);
    const expirationCheckInterval = setInterval(checkTokenExpiration, 3600000); // 1 hour

    // Custom event handlers
    const handleExpiredAuth = () => {
      console.log("Auth expired event received, navigating to login");
      // Save current path for redirect after login if not already on login
      if (location.pathname !== '/login') {
        saveCurrentPathForRedirect();
      }
      navigate("/login?expired=true", { replace: true });
    };

    const handleLogout = () => {
      console.log("Logout event received, navigating to login");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      navigate("/login?logout=true", { replace: true });
    };

    // Add event listeners for custom events
    window.addEventListener("user:expired", handleExpiredAuth);
    window.addEventListener("user:logout", handleLogout);

    // Cleanup function
    return () => {
      clearInterval(expirationCheckInterval);
      clearTimeout(inactivityTimeout);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
      window.removeEventListener("user:expired", handleExpiredAuth);
      window.removeEventListener("user:logout", handleLogout);
    };
  }, [navigate, location.pathname]);

  // This component doesn't render anything
  return null;
};

export default SessionManager;