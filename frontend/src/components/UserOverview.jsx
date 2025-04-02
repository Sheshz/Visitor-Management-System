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
import apiClient from "../utils/apiClient"; 
import "../CSS/Overview.css";

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

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use Promise.allSettled to handle multiple API requests gracefully
        const [statsResponse, notificationsResponse, hostsResponse, visitorsResponse, currentVisitorResponse] = 
          await Promise.allSettled([
            apiClient.get("/api/statistics/visitors").catch(() => ({ data: null })),
            apiClient.get("/api/notifications/recent").catch(() => ({ data: [] })),
            apiClient.get("/api/hosts/available").catch(() => ({ data: [] })),
            apiClient.get("/api/visitors/recent").catch(() => ({ data: [] })),
            apiClient.get("/api/visitors/current").catch(() => ({ data: null }))
          ]);

        // Handle visitor statistics
        if (statsResponse.status === "fulfilled" && statsResponse.value && statsResponse.value.data) {
          setVisitorStats(statsResponse.value.data);
        } else {
          console.log("Failed to fetch visitor statistics");
        }

        // Handle notifications
        if (notificationsResponse.status === "fulfilled" && notificationsResponse.value && notificationsResponse.value.data) {
          setNotifications(notificationsResponse.value.data);
        } else {
          console.log("Notifications endpoint not available");
          // Initialize with empty array to prevent length errors
          setNotifications([]);
        }

        // Handle hosts
        if (hostsResponse.status === "fulfilled" && hostsResponse.value && hostsResponse.value.data) {
          setHosts(hostsResponse.value.data);
        } else {
          console.log("Failed to fetch available hosts");
          setHosts([]);
        }

        // Handle recent visitors
        if (visitorsResponse.status === "fulfilled" && visitorsResponse.value && visitorsResponse.value.data) {
          setRecentVisitors(visitorsResponse.value.data);
        } else {
          console.log("Failed to fetch recent visitors");
          setRecentVisitors([]);
        }

        // Handle current visitor
        if (currentVisitorResponse.status === "fulfilled" && currentVisitorResponse.value && currentVisitorResponse.value.data) {
          setVisitorData(currentVisitorResponse.value.data);
        } else {
          console.log("No current visitor data available");
          setVisitorData(null);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err.response?.data || err.message);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const visitorChartData = {
    labels: visitorStats?.weeklyLabels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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

  if (isLoading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="overview-container">
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
                <div key={notification._id || index} className="notification-item">
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