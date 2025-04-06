import { useState, useEffect, useCallback } from "react";
import apiClient from "../utils/apiClient";

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Improved endpoint availability check - uses relative URLs consistently
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
      // Fix: Use relative URL consistently
      const notificationsAvailable = await checkEndpointAvailability("/api/notifications/user");

      if (notificationsAvailable) {
        try {
          const notifResponse = await apiClient.get("/api/notifications/user");
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
        // Fix: Use correct endpoint path
        const notificationsAvailable = await checkEndpointAvailability("/api/notifications/user");

        if (notificationsAvailable) {
          try {
            const notifResponse = await apiClient.get("/api/notifications/user");
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
      // Fix: Use correct endpoint path consistently
      const notificationsAvailable = await checkEndpointAvailability("/api/notifications/user");

      if (notificationsAvailable && isMounted) {
        interval = setInterval(() => {
          if (!isMounted) return;

          apiClient
            .get("/api/notifications/user")
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
      const notificationsAvailable = await checkEndpointAvailability("/api/notifications/user");

      if (notificationsAvailable) {
        await apiClient.put(`/api/notifications/${notificationId}/read`);

        // Update local state to reflect the change
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
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
      const notificationsAvailable = await checkEndpointAvailability("/api/notifications/user");

      if (notificationsAvailable) {
        await apiClient.put("/api/notifications/read-all");

        // Update local state to reflect all notifications read
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            read: true,
          }))
        );

        return true; // Success indicator
      } else {
        console.log(
          "Notifications endpoint not available for marking all as read"
        );
        return false; // Failure indicator
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      return false; // Failure indicator
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/api/notifications/user");
      return response.data;
    } catch (error) {
      // If the endpoint returns 404, handle it gracefully
      if (error.response && error.response.status === 404) {
        console.log("Notifications endpoint not available");
        return { notifications: [], unreadCount: 0 }; // Return empty data
      }

      // For other errors, continue with the throw
      throw error;
    }
  };

  // Add function to get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);

  return {
    userData,
    notifications,
    loading,
    error,
    refreshData,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    hasUnreadNotifications: notifications.some(
      (notification) => !notification.read
    ),
    unreadCount: getUnreadCount(),
  };
};

export default useUserData;