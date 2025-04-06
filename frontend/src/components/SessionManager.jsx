import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * SessionManager component that handles:
 * - Token validation and expiration
 * - User inactivity tracking with warnings
 * - Custom auth events
 * - Route protection
 * - Redirect preservation
 * - Refresh token mechanism
 */
const SessionManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [warningTime, setWarningTime] = useState(null);

  // Constants for timing (all in milliseconds)
  const INACTIVITY_LIMIT = 24 * 60 * 60 * 1000; // 24 hours (1 day) instead of 4 hours
  const WARNING_BEFORE_LOGOUT = 15 * 60 * 1000; // 15 minutes of warning
  const TOKEN_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes between checks
  const AUTO_REFRESH_BEFORE_EXPIRY = 30 * 60 * 1000; // 30 minutes refresh before expiry

  // Modal warning component
  const SessionWarningModal = () => {
    if (!showWarning) return null;

    // Calculate remaining time
    const remainingSeconds = Math.floor((warningTime - Date.now()) / 1000);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "#FEF3C7",
          border: "1px solid #F59E0B",
          borderRadius: "6px",
          padding: "16px",
          zIndex: 9999,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", color: "#92400E" }}>
          Session Expiring Soon
        </h3>
        <p style={{ margin: "0 0 12px 0" }}>
          Your session will expire in {minutes}:
          {seconds < 10 ? `0${seconds}` : seconds}.
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={extendSession}
            style={{
              backgroundColor: "#F59E0B",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Stay Logged In
          </button>
          <button
            onClick={() => logoutUser("manual_logout")}
            style={{
              backgroundColor: "#9CA3AF",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout Now
          </button>
        </div>
      </div>
    );
  };

  // Simple token decoding function using atob
  const decodeToken = (token) => {
    try {
      // First check if token exists and has the expected format
      if (!token || !token.includes(".")) {
        console.warn("Invalid token format");
        return null;
      }

      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  };

  // Check if token is expired or will expire soon
  const isTokenExpired = (token, bufferTime = 3600) => {
    try {
      const payload = decodeToken(token);

      // Check if payload has expiration time
      if (!payload || typeof payload.exp !== "number") {
        console.warn("Token doesn't have valid expiration data");
        return true;
      }

      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime + bufferTime / 1000;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  };

  // Get token expiration time in milliseconds
  const getTokenExpiryTime = (token) => {
    try {
      const payload = decodeToken(token);
      if (!payload || typeof payload.exp !== "number") {
        return null;
      }
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return null;
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
      // Also save form data and work in progress if possible
      const workInProgress = captureWorkInProgress();
      if (workInProgress) {
        sessionStorage.setItem(
          "workInProgress",
          JSON.stringify(workInProgress)
        );
      }
      sessionStorage.setItem("redirectAfterLogin", currentPath);
    }
  };

  // Attempt to capture form data to restore after login
  const captureWorkInProgress = () => {
    try {
      // Get all form elements on the page
      const forms = document.querySelectorAll("form");
      const formData = {};

      forms.forEach((form, index) => {
        const formElements = {};
        // Extract data from inputs
        form.querySelectorAll("input, textarea, select").forEach((element) => {
          if (element.name) {
            formElements[element.name] = element.value;
          } else if (element.id) {
            formElements[element.id] = element.value;
          }
        });

        if (Object.keys(formElements).length > 0) {
          formData[`form-${index}`] = formElements;
        }
      });

      return Object.keys(formData).length > 0 ? formData : null;
    } catch (error) {
      console.error("Error capturing work in progress:", error);
      return null;
    }
  };

  // Refresh token function - implement this with your backend
  const refreshToken = async () => {
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) return false;

      // This would be your actual refresh token API call
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem("token", token);
        return true;
      }

      // If refresh endpoint fails
      console.log("Token refresh failed - server responded with an error");
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  // Extend user session
  const extendSession = async () => {
    const success = await refreshToken();

    if (success) {
      console.log("Session extended successfully");
      setShowWarning(false);
      setWarningTime(null);
      // Reset activity timer
      resetActivityTimers();
    } else {
      console.log("Could not extend session, token refresh failed");
      // Show warning for at least a bit longer if extension fails
      setWarningTime(Date.now() + 3600000); // 1 hour extension even if refresh fails
    }
  };

  const logoutUser = (reason = "session_expired") => {
    console.log(`Logging out user due to: ${reason}`);

    // Hide warning if showing
    setShowWarning(false);

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

  const checkTokenExpiration = async () => {
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

    // Check if token is already expired
    if (isTokenExpired(token)) {
      console.log("Token expired, logging out user");
      logoutUser("expired_token");
      return;
    }

    // Check if token will expire soon and try to refresh
    if (isTokenExpired(token, AUTO_REFRESH_BEFORE_EXPIRY)) {
      console.log("Token will expire soon, attempting refresh");
      const refreshed = await refreshToken();
      if (!refreshed) {
        // If we couldn't refresh and token will expire very soon, show warning
        const expiryTime = getTokenExpiryTime(token);
        const timeUntilExpiry = expiryTime - Date.now();

        if (timeUntilExpiry < WARNING_BEFORE_LOGOUT) {
          console.log("Token about to expire, showing warning");
          setWarningTime(expiryTime);
          setShowWarning(true);
        }
      }
    }
  };

  // Reset all activity timers
  const resetActivityTimers = () => {
    // Store the last activity timestamp
    localStorage.setItem("lastActivityTime", Date.now().toString());

    // Hide warning if it's showing
    if (showWarning) {
      setShowWarning(false);
    }
  };

  useEffect(() => {
    // Check token immediately
    checkTokenExpiration();

    // For inactivity tracking
    let inactivityTimeout;
    let warningTimeout;

    const checkInactivity = () => {
      const lastActivity = parseInt(
        localStorage.getItem("lastActivityTime") || Date.now().toString()
      );
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivity;

      // If user has been inactive for too long, log them out
      if (inactiveTime >= INACTIVITY_LIMIT) {
        logoutUser("inactivity");
        return;
      }

      // If user is approaching inactivity limit, show warning
      if (inactiveTime >= INACTIVITY_LIMIT - WARNING_BEFORE_LOGOUT) {
        const expiryTime = lastActivity + INACTIVITY_LIMIT;
        setWarningTime(expiryTime);
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    const resetInactivityTimer = () => {
      resetActivityTimers();

      // Clear existing timers
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);

      // Set new timers
      inactivityTimeout = setTimeout(
        () => logoutUser("inactivity"),
        INACTIVITY_LIMIT
      );

      // Set timer to show warning before logout
      warningTimeout = setTimeout(() => {
        const expiryTime = Date.now() + WARNING_BEFORE_LOGOUT;
        setWarningTime(expiryTime);
        setShowWarning(true);
      }, INACTIVITY_LIMIT - WARNING_BEFORE_LOGOUT);
    };

    // Initialize last activity time if not set
    if (!localStorage.getItem("lastActivityTime")) {
      localStorage.setItem("lastActivityTime", Date.now().toString());
    }

    // Set up event listeners for activity tracking
    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Start inactivity timer
    resetInactivityTimer();

    // Regularly check token expiration but not too frequently
    const expirationCheckInterval = setInterval(
      checkTokenExpiration,
      TOKEN_CHECK_INTERVAL
    );

    // Also check inactivity regularly
    const inactivityCheckInterval = setInterval(checkInactivity, 3600000); // Every hour

    // Custom event handlers
    const handleExpiredAuth = () => {
      console.log("Auth expired event received, navigating to login");
      // Save current path for redirect after login if not already on login
      if (location.pathname !== "/login") {
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
    window.addEventListener("auth:expired", handleExpiredAuth);
    window.addEventListener("auth:logout", handleLogout);

    // Cleanup function
    return () => {
      clearInterval(expirationCheckInterval);
      clearInterval(inactivityCheckInterval);
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);

      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });

      window.removeEventListener("user:expired", handleExpiredAuth);
      window.removeEventListener("user:logout", handleLogout);
      window.removeEventListener("auth:expired", handleExpiredAuth);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [navigate, location.pathname]);

  // Render the warning modal if needed
  return showWarning ? <SessionWarningModal /> : null;
};

export default SessionManager;