import { useState, useEffect, useCallback } from "react";
import apiClient from "../utils/apiClient";

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if the API endpoint is available
  const checkEndpointAvailability = async (endpoint) => {
    try {
      await apiClient.head(endpoint);
      return true;
    } catch (error) {
      console.log(`${endpoint} endpoint not available`);
      return false;
    }
  };

  // Refresh user data and notifications
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to get user data
      const userResponse = await apiClient.get("/api/users/me");
      setUserData(userResponse.data);
      
      // Check if notifications endpoint exists before attempting to fetch
      // Fix: Use relative URL for consistency with setupPolling
      const notificationsAvailable = await checkEndpointAvailability("http://localhost:5000/api/notifications");
      
      if (notificationsAvailable) {
        try {
          const notifResponse = await apiClient.get("/api/notifications");
          setNotifications(notifResponse.data || []);
        } catch (notifError) {
          console.error("Error refreshing notifications:", notifError);
          // Don't set an error for notifications failure
          setNotifications([]); // Set empty array to avoid undefined errors
        }
      } else {
        console.log("Notifications endpoint not available");
        setNotifications([]); // Set empty array as fallback
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
      setError(err.response?.data?.message || "Failed to refresh user data");
      // Set default values to prevent null reference errors
      setUserData(null);
      setNotifications([]);
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
    let interval;
    
    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        // First try to get user data
        const userResponse = await apiClient.get("/api/users/me");
        if (isMounted) {
          setUserData(userResponse.data);
        }
        
        // Check if notifications endpoint exists before attempting to fetch
        // Fix: Use relative URL for consistency
        const notificationsAvailable = await checkEndpointAvailability("http://localhost:5000/api/notifications");
        
        if (notificationsAvailable) {
          try {
            const notifResponse = await apiClient.get("/api/notifications");
            if (isMounted) {
              setNotifications(notifResponse.data || []);
            }
          } catch (notifError) {
            if (isMounted) {
              console.error("Error fetching notifications:", notifError);
              // Don't set error for notifications
              setNotifications([]); // Set empty array to avoid undefined errors
            }
          }
        } else {
          console.log("Notifications endpoint not available");
          if (isMounted) {
            setNotifications([]); // Set empty array as fallback
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching user data:", err);
          setError(err.response?.data?.message || "Failed to fetch user data");
          // Set default values to prevent null reference errors
          setUserData(null);
          setNotifications([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Setup polling for notifications
    const setupPolling = async () => {
      // Fix: Use relative URL for consistency instead of absolute URL
      const notificationsAvailable = await checkEndpointAvailability("http://localhost:5000/api/notifications");
      
      if (notificationsAvailable && isMounted) {
        interval = setInterval(() => {
          if (!isMounted) return;
          
          apiClient.get("/api/notifications")
            .then((response) => {
              if (isMounted) {
                setNotifications(response.data || []);
              }
            })
            .catch((err) => {
              console.error("Error polling notifications:", err);
              // Don't update state on polling errors
            });
        }, 60000); // Every minute
      }
    };
    
    // Initial data load
    fetchData();
    
    // Setup polling after initial load
    setupPolling();

    // Cleanup function
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Function to mark notification as read (with endpoint availability check)
  const markNotificationAsRead = async (notificationId) => {
    try {
      const notificationsAvailable = await checkEndpointAvailability("http://localhost:5000/api/notifications");
      
      if (notificationsAvailable) {
        await apiClient.put(`/api/notifications/${notificationId}/read`);
        
        // Update local state to reflect the change
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        );
        
        return true; // Success indicator
      } else {
        console.log("Notifications endpoint not available for marking as read");
        return false; // Failure indicator
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return false; // Failure indicator
    }
  };

  // Function to mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const notificationsAvailable = await checkEndpointAvailability("http://localhost:5000/api/notifications");
      
      if (notificationsAvailable) {
        await apiClient.put('/api/notifications/read-all');
        
        // Update local state to reflect all notifications read
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
        
        return true; // Success indicator
      } else {
        console.log("Notifications endpoint not available for marking all as read");
        return false; // Failure indicator
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      return false; // Failure indicator
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/api/notifications");
      return response.data;
    } catch (error) {
      // If the endpoint returns 404, handle it gracefully
      if (error.response && error.response.status === 404) {
        console.log("http://localhost:5000/api/notifications endpoint not available");
        return { notifications: [], unreadCount: 0 }; // Return empty data
      }
      
      // For other errors, continue with the throw
      throw error;
    }
  };
  return { 
    userData, 
    notifications, 
    loading, 
    error, 
    refreshData,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    hasUnreadNotifications: notifications.some(notification => !notification.read)
  };
};

export default useUserData;