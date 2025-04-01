import { useState, useEffect, useCallback } from "react";
import apiClient from "../utils/apiClient";

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userResponse = await apiClient.get("/api/users/me");
      setUserData(userResponse.data);
      
      try {
        const notifResponse = await apiClient.get("/api/notifications");
        setNotifications(notifResponse.data);
      } catch (notifError) {
        console.error("Error refreshing notifications:", notifError);
        // Don't set an error for notifications failure
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
      setError(err.response?.data?.message || "Failed to refresh user data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const userResponse = await apiClient.get("/api/users/me");
        if (isMounted) {
          setUserData(userResponse.data);
        }
        
        try {
          const notifResponse = await apiClient.get("/api/notifications");
          if (isMounted) {
            setNotifications(notifResponse.data);
          }
        } catch (notifError) {
          if (isMounted) {
            console.error("Error fetching notifications:", notifError);
            // Don't set error for notifications
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching user data:", err);
          setError(err.response?.data?.message || "Failed to fetch user data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Poll for new notifications periodically
    const interval = setInterval(() => {
      if (isMounted) {
        apiClient.get("/api/notifications")
          .then((response) => {
            if (isMounted) {
              setNotifications(response.data);
            }
          })
          .catch((err) => {
            console.error("Error polling notifications:", err);
          });
      }
    }, 60000); // Every minute

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { userData, notifications, loading, error, refreshData };
};

export default useUserData;