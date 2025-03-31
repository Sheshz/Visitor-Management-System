import React, { useState, useEffect } from "react";
import {
  ChartLine,
  User,
  Book,
  Calendar,
  QrCode,
  Home,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  Mail,
  Phone,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import axios from "axios";
import "../CSS/UserDashboard.css";
import Profile from "./Profile"; // Import the Profile component

const UserDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
  
        if (!token) throw new Error('No authentication token found');
  
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error.response?.data || error.message);
        setError('Failed to load user data');
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { name: "Overview", icon: <ChartLine size={20} /> },
    { name: "Profile", icon: <User size={20} /> },
    { name: "Host Directory", icon: <Book size={20} /> },
    { name: "Appointment", icon: <Calendar size={20} /> },
    { name: "QR Scanner", icon: <QrCode size={20} /> },
    { name: "Become a Host", icon: <Home size={20} /> },
    { name: "Notifications", icon: <Bell size={20} /> },
    { name: "Logout", icon: <LogOut size={20} /> },
  ];

  // Sample visitor data
  const visitorData = {
    id: "MD2041A/291",
    fullName: "Andre Tosin, ADERINDE",
    email: "andretosin@gmail.com",
    phone: "+234 812 888 5604",
    date: "+234 812 888 5604",
    time: "15:30 WAT",
  };

  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!userData || !userData.firstName || !userData.lastName) {
      return "U"; // Default Initial
    }
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="logo-container">
          <div className="logo-wrapper">
            <div className="logo">GP</div>
            {!collapsed && <span className="logo-text">GetePass Pro</span>}
          </div>
          {!collapsed && (
            <button onClick={toggleSidebar} className="collapse-btn">
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="expand-btn-container">
            <button onClick={toggleSidebar} className="expand-btn">
              <Menu size={20} />
            </button>
          </div>
        )}

        <div className="menu-container">
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => {
                setActiveMenu(item.name);
                if (item.name === "Logout") {
                  handleLogout();
                }
              }}
              className={`menu-item ${
                activeMenu === item.name ? "active" : ""
              }`}
            >
              <div className={collapsed ? "icon-centered" : "icon"}>
                {item.icon}
              </div>
              {!collapsed && <span className="menu-text">{item.name}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">User VMS Dashboard</h1>
          <div className="user-section">
            <Mail size={20} className="mail-icon" />
            <div className="notification-dot"></div>
            {userData ? (
              <div className="user-profile">
                <div className="avatar">{getUserInitials()}</div>
                <div className="user-info">
                  <div className="user-name">
                    {userData.firstName} {userData.lastName}
                  </div>
                  <div className="user-role">
                    {userData.role === "user"
                      ? "Standard account"
                      : userData.role}
                  </div>
                </div>
              </div>
            ) : (
              <div>Loading user...</div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="content-wrapper">
          {activeMenu === "Overview" && (
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
                  <User size={20} className="detail-icon" />
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
                  <CalendarIcon size={20} className="detail-icon" />
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

          {activeMenu === "Profile" && (
            <Profile />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;