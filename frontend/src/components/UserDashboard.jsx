import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  HelpCircle,
  Settings,
  ChevronDown,
  Users
} from "lucide-react";
import "../CSS/UserDashboard.css";
import Profile from "./Profile";
import UserOverview from "./UserOverview";
import CreateHostProfile from "./hosts/CreateHostProfile";
import Notifications from "./Notifications";
import generateColorFromEmail from "../utils/generateColor";
import useUserData from "../hooks/useUserData";
import MyVisitation from "../components/user/MyVisitation";
import AppointmentConfirmation from "./Appointment";
import HostDirectory from "./hosts/HostDirectory";

// Create a session storage manager to isolate sessions per tab
const SessionManager = {
  // Use sessionStorage instead of localStorage for tab-specific storage
  setItem: (key, value) => {
    sessionStorage.setItem(key, value);
  },
  getItem: (key) => {
    return sessionStorage.getItem(key);
  },
  removeItem: (key) => {
    sessionStorage.removeItem(key);
  },
  clear: () => {
    sessionStorage.clear();
  }
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Check if token exists and redirect if not - use sessionStorage instead
  useEffect(() => {
    const token = SessionManager.getItem("token");
    if (!token) {
      // Transfer token from localStorage to sessionStorage on initial load if available
      const localToken = localStorage.getItem("token");
      if (localToken) {
        SessionManager.setItem("token", localToken);
        // Remove from localStorage to prevent cross-tab synchronization
        localStorage.removeItem("token");
      } else {
        navigate("/login");
        return;
      }
    }
  }, [navigate]);

  // Modify useUserData hook to use sessionStorage token (assuming you can modify the hook)
  // If you can't modify the hook, you may need to pass the token as a prop
  const { userData, notifications, loading, error, refreshData } = useUserData();

  // Generate profile color based on user email when available
  const profileColor = userData?.email ? generateColorFromEmail(userData.email) : "#4A5568";

  // Check for new notifications whenever notifications array changes
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setHasNewNotifications(notifications.some(notif => !notif.read));
    }
  }, [notifications]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownRef]);

  // Store user data in sessionStorage instead of localStorage
  useEffect(() => {
    if (userData) {
      // Store the full name
      if (userData.firstName && userData.lastName) {
        SessionManager.setItem("userName", `${userData.firstName} ${userData.lastName}`);
      } else if (userData.name) {
        SessionManager.setItem("userName", userData.name);
      }
      
      // Store email if available
      if (userData.email) {
        SessionManager.setItem("userEmail", userData.email);
      }
      
      // Store username if available
      if (userData.username) {
        SessionManager.setItem("username", userData.username);
      }
    }
  }, [userData]);

  // Listen for storage events to prevent cross-tab data sharing
  useEffect(() => {
    const handleStorageChange = (event) => {
      // If localStorage token changes in another tab, don't let it affect this tab
      if (event.key === 'token' && event.storageArea === localStorage) {
        // Keep using this tab's session token
        event.stopPropagation();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
    { name: "My Visitation", icon: <Users size={20} /> },
    { name: "Become a Host", icon: <Home size={20} /> },
    { name: "Notifications", icon: <Bell size={20} /> },
    { name: "Logout", icon: <LogOut size={20} /> },
  ];

  // Function to get user initials for avatar if no profile image is available
  const getUserInitials = () => {
    if (!userData || !userData.firstName) {
      return userData?.name?.charAt(0) || "U";
    }
    return `${userData.firstName.charAt(0)}${userData.lastName ? userData.lastName.charAt(0) : ''}`;
  };

  // Handle notification icon click
  const handleNotificationClick = () => {
    setActiveMenu("Notifications");
    setHasNewNotifications(false);
  };

  // Handle logout - use SessionManager
  const handleLogout = () => {
    // Clear only sessionStorage
    SessionManager.clear();
    // Dispatch a custom event that SessionManager is listening for
    window.dispatchEvent(new Event("user:logout"));
    // Redirect to login page
    navigate("/login");
  };

  // Retry fetching data if there's an error
  const handleRetry = () => {
    refreshData();
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
        <button onClick={handleRetry} className="retry-button">Retry</button>
        <button onClick={handleLogout} className="logout-button">Go to Login</button>
      </div>
    );
  }

  // Get display name for user
  const displayName = userData?.firstName && userData?.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.name || "User";

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
                if (item.name === "Logout") {
                  handleLogout();
                } else {
                  setActiveMenu(item.name);
                }
              }}
              className={`menu-item ${activeMenu === item.name ? "active" : ""}`}
            >
              <div className={collapsed ? "icon-centered" : "icon"}>{item.icon}</div>
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
            <div className="notification-icon" onClick={handleNotificationClick}>
              <Mail size={18} className="mail-icon" />
              {hasNewNotifications && <div className="notification-dot"></div>}
            </div>

            {userData ? (
              <div
                className="user-profile"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                ref={profileDropdownRef}
              >
                <div className="avatar" style={{ backgroundColor: profileColor }}>
                  {userData.profileImage ? (
                    <img src={userData.profileImage} alt="Profile" />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{displayName}</div>
                  <div className="user-role">
                    {userData.role === "user" ? "Standard account" : userData.role || "User"}
                  </div>
                </div>
                <ChevronDown size={14} color="#718096" />
                {showProfileDropdown && (
                  <div className="profile-dropdown show">
                    <div className="dropdown-item" onClick={() => setActiveMenu("Profile")}>
                      <User size={16} />
                      <span>Profile</span>
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setActiveMenu("Profile");
                        SessionManager.setItem("profileActiveTab", "settings");
                      }}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </div>
                    <div className="dropdown-item">
                      <HelpCircle size={16} />
                      <span>Support</span>
                    </div>
                    <div className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>No user data available</div>
            )}
          </div>
        </div>
        {/* Dashboard Content */}
        <div className="content-wrapper">
          {activeMenu === "Overview" && <UserOverview />}
          {activeMenu === "Profile" && <Profile />}
          {activeMenu === "Become a Host" && <CreateHostProfile />}
          {activeMenu === "Notifications" && <Notifications notifications={notifications} />}
          {activeMenu === "My Visitation" && <MyVisitation />}
          {activeMenu === "Appointment"&& <AppointmentConfirmation/>}
          {activeMenu === "Host Directory" && <HostDirectory/>}
          {/* Add other menu components as needed */}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;