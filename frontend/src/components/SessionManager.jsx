import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionManager = () => {
  const navigate = useNavigate();

  // Simple token decoding function using atob
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error parsing token:", error);
      return true;
    }
  };

  const logoutUser = () => {
    console.log("Logging out user due to expired token or inactivity");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (!["/login", "/register", "/"].includes(window.location.pathname)) {
        navigate("/login");
      }
      return;
    }
    if (isTokenExpired(token)) {
      console.log("Token expired, logging out user");
      logoutUser();
    }
  };

  let inactivityTimeout;
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(logoutUser, 600000); // 10 minutes
  };

  useEffect(() => {
    // Check token immediately
    checkTokenExpiration();
    
    // Set up event listeners for activity tracking
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);
    
    // Start inactivity timer
    resetInactivityTimer();
    
    // Regularly check token expiration
    const expirationCheckInterval = setInterval(checkTokenExpiration, 60000);

    return () => {
      clearInterval(expirationCheckInterval);
      clearTimeout(inactivityTimeout);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default SessionManager;