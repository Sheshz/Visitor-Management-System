import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Users, Mail, Phone, Calendar, Clock, Bell } from "lucide-react";
import apiClient, { apiHelper } from "../../utils/apiClient";
import "../../CSS/Overview.css";

// Development mode flag - set to true to extend session timeouts
const DEV_MODE = true;
// Session timeout duration in milliseconds (24 hours in dev mode)
const SESSION_TIMEOUT = DEV_MODE ? 86400000 : 30 * 60 * 1000; // 24 hours in dev vs 30 minutes

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const UserOverview = () => {
  // State variables
  const [visitorStats, setVisitorStats] = useState({
    totalVisitors: 0,
    todayAppointments: 0,
    checkedIn: 0,
    weeklyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    visitorTypes: [0, 0, 0, 0],
  });
  const [notifications, setNotifications] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visitorData, setVisitorData] = useState(null);
  const [error, setError] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [endpointMap, setEndpointMap] = useState({
    visitors: {
      current: [
        "/api/visitors/current",
        "/api/visitors/active/me",
        "/api/visitors/me",
      ],
      active: [
        "/api/visitors/active",
        "/api/active-visitors",
        "/api/visitors/status/active",
      ],
    },
  });

  // Function to check endpoint availability with proper error handling
  const checkEndpointAvailability = async (endpoint) => {
    try {
      await apiClient.head(endpoint);
      return true;
    } catch (error) {
      console.log(`${endpoint} endpoint not available`);
      return false;
    }
  };

  // Enhanced token refresh function with extended time for development
  const refreshTokenIfNeeded = async () => {
    if (DEV_MODE) {
      // In dev mode, always refresh token if it's older than 23 hours
      const tokenAge = Date.now() - lastRefreshTime;
      if (tokenAge > SESSION_TIMEOUT - 3600000) {
        // Refresh 1 hour before expiration
        console.log("Dev mode: Preemptively refreshing token");
        const success = await apiHelper.refreshAuthToken();
        if (success) {
          setLastRefreshTime(Date.now());
          return true;
        }
      }
      return apiHelper.isAuthenticated(); // Still authenticated in dev mode
    } else {
      // Normal authentication check in production
      return apiHelper.isAuthenticated();
    }
  };

  // Find an available endpoint from a list of alternatives
  const findWorkingEndpoint = async (endpointList) => {
    for (const endpoint of endpointList) {
      const isAvailable = await checkEndpointAvailability(endpoint);
      if (isAvailable) {
        return endpoint;
      }
    }
    return null;
  };

  // Fetch data from the first available endpoint in a list
  const fetchFromFirstAvailableEndpoint = async (
    endpointList,
    defaultValue = null
  ) => {
    const workingEndpoint = await findWorkingEndpoint(endpointList);

    if (workingEndpoint) {
      try {
        const response = await apiClient.get(workingEndpoint);
        return response.data;
      } catch (error) {
        console.log(`Error fetching from ${workingEndpoint}:`, error.message);
        return defaultValue;
      }
    }

    console.log(`No available endpoints found in: ${endpointList.join(", ")}`);
    return defaultValue;
  };

  // Fetch data on component mount with extended timeouts for development
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use apiHelper.fetchWithFallback for better endpoint handling
        const statsData = await apiHelper.fetchWithFallback(
          "/api/statistics/visitors",
          {
            totalVisitors: 0,
            todayAppointments: 0,
            checkedIn: 0,
            weeklyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            weeklyData: [0, 0, 0, 0, 0, 0, 0],
            visitorTypes: [0, 0, 0, 0],
          }
        );

        // For notifications, try multiple known endpoints using the endpoint mapping functionality
        const notificationsData = await apiHelper.handleMissingEndpoint(
          "/api/notifications/recent",
          []
        );

        // Fetch hosts data with fallback
        const hostsData = await apiHelper.fetchWithFallback(
          "/api/hosts/available",
          []
        );

        // Fetch recent visitors with fallback
        const recentVisitorsData = await apiHelper.fetchWithFallback(
          "/api/visitors/recent",
          []
        );

        // For current visitor, try multiple known endpoints
        const currentVisitorData = await fetchFromFirstAvailableEndpoint(
          endpointMap.visitors.current,
          null
        );

        // For active visitors, try multiple known endpoints
        const activeVisitorsData = await fetchFromFirstAvailableEndpoint(
          endpointMap.visitors.active,
          []
        );

        // Update state with fetched data
        if (statsData) setVisitorStats(statsData);
        if (notificationsData) setNotifications(notificationsData);
        if (hostsData) setHosts(hostsData);
        if (recentVisitorsData) setRecentVisitors(recentVisitorsData);
        if (currentVisitorData) setVisitorData(currentVisitorData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err.message);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    // Check authentication with development mode considerations
    refreshTokenIfNeeded().then((isAuthenticated) => {
      if (isAuthenticated) {
        fetchDashboardData();
      } else {
        // Try to refresh token if not authenticated
        apiHelper.refreshAuthToken().then((success) => {
          if (success) {
            setLastRefreshTime(Date.now());
            fetchDashboardData();
          } else {
            if (DEV_MODE) {
              console.warn(
                "Dev mode: Authentication failed but proceeding anyway"
              );
              fetchDashboardData(); // In dev mode, try to fetch data anyway
            } else {
              setError("Authentication required. Please log in again.");
              setIsLoading(false);
            }
          }
        });
      }
    });

    // Set up periodic token refresh for development mode
    if (DEV_MODE) {
      const refreshInterval = setInterval(() => {
        console.log("Dev mode: Performing scheduled token refresh");
        apiHelper.refreshAuthToken().then((success) => {
          if (success) {
            setLastRefreshTime(Date.now());
            console.log("Dev mode: Token refreshed successfully");
          } else {
            console.warn("Dev mode: Scheduled token refresh failed");
          }
        });
      }, SESSION_TIMEOUT / 2); // Refresh halfway through the session timeout

      return () => clearInterval(refreshInterval);
    }
  }, []);

  // Prepare chart data
  const visitorChartData = {
    labels: visitorStats?.weeklyLabels || [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    datasets: [
      {
        label: "Visitors This Week",
        data: visitorStats?.weeklyData || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgb(53, 162, 235)",
        borderWidth: 1,
      },
    ],
  };

  const visitorTypeData = {
    labels: ["Appointments", "Walk-ins", "Deliveries", "Interviews"],
    datasets: [
      {
        label: "Visitor Types",
        data: visitorStats?.visitorTypes || [0, 0, 0, 0],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Weekly Visitor Traffic",
      },
    },
  };

  // Handle session expired event with extended grace period in dev mode
  useEffect(() => {
    const handleSessionExpired = () => {
      if (DEV_MODE) {
        console.warn(
          "Dev mode: Session expired event received, attempting to refresh token"
        );
        // In dev mode, try to refresh the token instead of showing error
        apiHelper.refreshAuthToken().then((success) => {
          if (success) {
            setLastRefreshTime(Date.now());
            console.log("Dev mode: Token refreshed after session expiry");
          } else {
            console.error(
              "Dev mode: Failed to refresh token after session expiry"
            );
            setError(
              "Your session has expired. Please log in again. (Dev mode active)"
            );
          }
        });
      } else {
        setError("Your session has expired. Please log in again.");
      }
      setIsLoading(false);
    };

    window.addEventListener("user:expired", handleSessionExpired);

    return () => {
      window.removeEventListener("user:expired", handleSessionExpired);
    };
  }, []);

  // Show development mode indicator when active
  const DevModeIndicator = () => {
    if (!DEV_MODE) return null;

    return (
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          backgroundColor: "rgba(255, 0, 0, 0.7)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        DEV MODE ACTIVE - Extended Session (
        {Math.floor(SESSION_TIMEOUT / 3600000)}h)
      </div>
    );
  };

  if (isLoading) {
    return (
      <>
        <div className="loading">Loading dashboard data...</div>
        {DEV_MODE && <DevModeIndicator />}
      </>
    );
  }

  if (error && !DEV_MODE) {
    return (
      <>
        <div className="error-message">{error}</div>
        {DEV_MODE && <DevModeIndicator />}
      </>
    );
  }

  return (
    <div className="overview-container">
      {DEV_MODE && <DevModeIndicator />}

      {visitorData && (
        <div className="visitor-card">
          <div className="visitor-header">
            <h2 className="visitor-title">
              Visitor's Profile:{" "}
              <span className="visitor-id">{visitorData.id}</span>
            </h2>
            <div className="visitor-id-top">{visitorData.id}</div>
          </div>

          <div className="visitor-details">
            <div className="detail-row">
              <Users size={20} className="detail-icon" />
              <div className="detail-label">Full Name</div>
              <div className="detail-value">{visitorData.fullName}</div>
            </div>

            <div className="detail-row">
              <Mail size={20} className="detail-icon" />
              <div className="detail-label">Email Address</div>
              <div className="detail-value">{visitorData.email}</div>
            </div>

            <div className="detail-row">
              <Phone size={20} className="detail-icon" />
              <div className="detail-label">Phone Number</div>
              <div className="detail-value">{visitorData.phone}</div>
            </div>

            <div className="detail-row">
              <Calendar size={20} className="detail-icon" />
              <div className="detail-label">Date</div>
              <div className="detail-value">{visitorData.date}</div>
            </div>

            <div className="detail-row last">
              <Clock size={20} className="detail-icon" />
              <div className="detail-label">Time</div>
              <div className="detail-value">{visitorData.time}</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon visitors">
            <Users size={20} />
          </div>
          <div className="card-details">
            <h3>Total Visitors</h3>
            <p className="card-value">{visitorStats?.totalVisitors || 0}</p>
            <p className="card-period">Today</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon appointments">
            <Calendar size={20} />
          </div>
          <div className="card-details">
            <h3>Appointments</h3>
            <p className="card-value">{visitorStats?.todayAppointments || 0}</p>
            <p className="card-period">Today</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon pending">
            <Clock size={20} />
          </div>
          <div className="card-details">
            <h3>Check-ins</h3>
            <p className="card-value">{visitorStats?.checkedIn || 0}</p>
            <p className="card-period">Active</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon notifications">
            <Bell size={20} />
          </div>
          <div className="card-details">
            <h3>Notifications</h3>
            <p className="card-value">{notifications?.length || 0}</p>
            <p className="card-period">Unread</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-container">
        <div className="chart-card">
          <h2>Visitor Traffic</h2>
          <div className="chart-wrapper">
            <Bar options={chartOptions} data={visitorChartData} />
          </div>
        </div>

        <div className="chart-card">
          <h2>Visitor Types</h2>
          <div className="chart-wrapper pie-chart">
            <Pie
              data={visitorTypeData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* Hosts and Notifications Row */}
      <div className="hosts-notifications-container">
        {/* Available Hosts */}
        <div className="section-card hosts-card">
          <div className="section-header">
            <h2>Available Hosts</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="hosts-list">
            {hosts && hosts.length > 0 ? (
              hosts.map((host, index) => (
                <div key={host._id || index} className="host-item">
                  <div className="host-avatar">
                    {host.profileImage ? (
                      <img src={host.profileImage} alt={host.name} />
                    ) : (
                      <span>{host.name?.charAt(0) || "?"}</span>
                    )}
                  </div>
                  <div className="host-info">
                    <h3>{host.name || "Unknown Host"}</h3>
                    <p>{host.bio || "No information available"}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No available hosts at the moment.</p>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="section-card notifications-card">
          <div className="section-header">
            <h2>Recent Notifications</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="notifications-list">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div
                  key={notification._id || index}
                  className="notification-item"
                >
                  <p>{notification.message || "No message"}</p>
                  <small>
                    {notification.timestamp
                      ? new Date(notification.timestamp).toLocaleString()
                      : "No timestamp"}
                  </small>
                </div>
              ))
            ) : (
              <p>No notifications at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;
