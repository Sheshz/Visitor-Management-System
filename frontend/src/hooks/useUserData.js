import { useState, useEffect, useCallback } from "react";
import apiClient from "../utils/apiClient";

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Improved endpoint availability check with CORS handling
  const checkEndpointAvailability = async (endpoint) => {
    try {
      // Use OPTIONS method instead of HEAD for preflight check
      const response = await apiClient({
        method: "OPTIONS",
        url: endpoint,
        headers: {
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "x-user-token",
        },
      });
      return response.status < 400;
    } catch (error) {
      console.log(`${endpoint} endpoint not available`, error.message);
      return false;
    }
  };

  // Configure apiClient for CORS
  const configuredApiClient = {
    get: async (url, config = {}) => {
      try {
        return await apiClient.get(url, {
          ...config,
          withCredentials: true, // Send cookies with cross-origin requests
          headers: {
            ...config.headers,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        // Handle CORS errors more gracefully
        if (error.message && error.message.includes("CORS")) {
          console.error(`CORS error accessing ${url}:`, error.message);
          throw new Error(
            `CORS policy blocked access to ${url}. Ensure the server allows cross-origin requests.`
          );
        }
        throw error;
      }
    },
    put: async (url, data, config = {}) => {
      try {
        return await apiClient.put(url, data, {
          ...config,
          withCredentials: true,
          headers: {
            ...config.headers,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        if (error.message && error.message.includes("CORS")) {
          console.error(`CORS error accessing ${url}:`, error.message);
          throw new Error(
            `CORS policy blocked access to ${url}. Ensure the server allows cross-origin requests.`
          );
        }
        throw error;
      }
    },
  };

  // Refresh user data and notifications
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First try to get user data
      const userResponse = await configuredApiClient.get("/api/users/me");
      setUserData(userResponse.data);

      // Check if notifications endpoint exists before attempting to fetch
      const notificationsAvailable = await checkEndpointAvailability(
        "/api/notifications/user"
      );

      if (notificationsAvailable) {
        try {
          const notifResponse = await configuredApiClient.get(
            "/api/notifications/user"
          );
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
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to refresh user data"
      );
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
        const userResponse = await configuredApiClient.get("/api/users/me");
        if (isMounted) {
          setUserData(userResponse.data);
        }

        // Check if notifications endpoint exists before attempting to fetch
        const notificationsAvailable = await checkEndpointAvailability(
          "/api/notifications/user"
        );

        if (notificationsAvailable) {
          try {
            const notifResponse = await configuredApiClient.get(
              "/api/notifications/user"
            );
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
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to fetch user data"
          );
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

    // Setup polling for notifications with exponential backoff on errors
    const setupPolling = async () => {
      let retryDelay = 60000; // Start with 1 minute
      let consecutiveErrors = 0;

      const notificationsAvailable = await checkEndpointAvailability(
        "/api/notifications/user"
      );

      if (notificationsAvailable && isMounted) {
        interval = setInterval(async () => {
          if (!isMounted) return;

          try {
            const response = await configuredApiClient.get(
              "/api/notifications/user"
            );
            if (isMounted) {
              setNotifications(response.data || []);
              consecutiveErrors = 0;
              retryDelay = 60000; // Reset to 1 minute after success
            }
          } catch (err) {
            console.error("Error polling notifications:", err);

            // Implement exponential backoff for polling on errors
            consecutiveErrors++;
            if (consecutiveErrors > 3) {
              // Exponential backoff, max 5 minutes
              retryDelay = Math.min(retryDelay * 2, 300000);

              // Update polling interval
              if (interval) clearInterval(interval);
              if (isMounted) {
                interval = setInterval(async () => {
                  try {
                    const response = await configuredApiClient.get(
                      "/api/notifications/user"
                    );
                    if (isMounted) {
                      setNotifications(response.data || []);
                    }
                  } catch (err) {
                    console.error("Error in polling interval:", err);
                  }
                }, retryDelay);
              }
            }
          }
        }, retryDelay); // Initial polling interval
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
      const notificationsAvailable = await checkEndpointAvailability(
        "/api/notifications/user"
      );

      if (notificationsAvailable) {
        await configuredApiClient.put(
          `/api/notifications/${notificationId}/read`
        );

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
      const notificationsAvailable = await checkEndpointAvailability(
        "/api/notifications/user"
      );

      if (notificationsAvailable) {
        await configuredApiClient.put("/api/notifications/read-all");

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
      const response = await configuredApiClient.get("/api/notifications/user");
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
    return notifications.filter((notification) => !notification.read).length;
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

// Fix: Add default export
export default useUserData;
