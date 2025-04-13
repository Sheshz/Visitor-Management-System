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
  Users,
} from "lucide-react";
import "../CSS/UserDashboard.css";
import Profile from "./user/Profile";
import UserOverview from "./user/UserOverview";
import CreateHostProfile from "./hosts/HostProfileCreation";
import Notifications from "./user/Notifications";
import generateColorFromEmail from "../utils/generateColor";
import useUserData from "../hooks/useUserData";
import MyVisitation from "../components/user/MyVisitation";
import AppointmentConfirmation from "./user/Appointment";
import HostDirectory from "./hosts/HostDirectory";

// Import the enhanced SessionManager
import { SessionManager } from "../utils/SessionManager";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if token exists and redirect if not
  useEffect(() => {
    // Try to transfer from localStorage if needed
    SessionManager.transferFromLocalStorage();
    
    // Check if authenticated with valid token after transfer
    if (!SessionManager.isAuthenticated()) {
      // Attempt to check for legacy token in localStorage
      const localToken = localStorage.getItem("token");
      if (localToken) {
        // Set it in sessionManager
        SessionManager.setToken(localToken);
        
        // Also set it as a user token for the new system
        SessionManager.setUserToken(localToken);
      } else {
        // No valid token anywhere, redirect to login
        navigate("/login", { replace: true });
        return;
      }
    }
    
    // User is authenticated, refresh token expiration to extend session
    SessionManager.refreshTokenExpiration();
    setAuthChecked(true);
  }, [navigate]);

  // Modify useUserData hook to use the token from SessionManager
  const { userData, notifications, loading, error, refreshData } = useUserData(
    SessionManager.getToken()
  );

  // Generate profile color based on user email when available
  const profileColor = userData?.email
    ? generateColorFromEmail(userData.email)
    : "#4A5568";

  // Check for new notifications whenever notifications array changes
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setHasNewNotifications(notifications.some((notif) => !notif.read));
    }
  }, [notifications]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
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
        SessionManager.setItem(
          "userName",
          `${userData.firstName} ${userData.lastName}`
        );
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
      if (event.key === "token" && event.storageArea === localStorage) {
        // Keep using this tab's session token
        event.stopPropagation();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
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
    return `${userData.firstName.charAt(0)}${
      userData.lastName ? userData.lastName.charAt(0) : ""
    }`;
  };

  // Handle notification icon click
  const handleNotificationClick = () => {
    setActiveMenu("Notifications");
    setHasNewNotifications(false);
  };

  // Handle logout - use enhanced SessionManager
  const handleLogout = () => {
    // Clear sessionStorage
    SessionManager.logout();
    // Dispatch a custom event if needed
    window.dispatchEvent(new Event("user:logout"));
    // Redirect to login page
    navigate("/login");
  };

  // Retry fetching data if there's an error
  const handleRetry = () => {
    refreshData(SessionManager.getToken());
  };

  // If still checking authentication
  if (!authChecked) {
    return <div className="userDashboardLoading">Checking authentication...</div>;
  }

  if (loading) return <div className="userDashboardLoading">Loading dashboard...</div>;

  if (error) {
    return (
      <div className="userDashboardErrorContainer">
        <div className="userDashboardErrorMessage">Error: {error}</div>
        <button onClick={handleRetry} className="userDashboardRetryButton">
          Retry
        </button>
        <button onClick={handleLogout} className="userDashboardLogoutButton">
          Go to Login
        </button>
      </div>
    );
  }

  // Get display name for user
  const displayName =
    userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData?.name || "User";

  return (
    <div className="userDashboardContainer">
      {/* Sidebar */}
      <div className={`userDashboardSidebar ${collapsed ? "userDashboardCollapsed" : ""}`}>
        <div className="userDashboardLogoContainer">
          <div className="userDashboardLogoWrapper">
            <div className="userDashboardLogo">GP</div>
            {!collapsed && <span className="userDashboardLogoText">GetPass Pro</span>}
          </div>
          {!collapsed && (
            <button onClick={toggleSidebar} className="userDashboardCollapseBtn">
              <ChevronLeft size={20} />
            </button>
          )}
        </div>
        {collapsed && (
          <div className="userDashboardExpandBtnContainer">
            <button onClick={toggleSidebar} className="userDashboardExpandBtn">
              <Menu size={20} />
            </button>
          </div>
        )}
        <div className="userDashboardMenuContainer">
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
              className={`userDashboardMenuItem ${
                activeMenu === item.name ? "userDashboardActive" : ""
              }`}
            >
              <div className={collapsed ? "userDashboardIconCentered" : "userDashboardIcon"}>
                {item.icon}
              </div>
              {!collapsed && <span className="userDashboardMenuText">{item.name}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="userDashboardMainContent">
        {/* Header */}
        <div className="userDashboardHeader">
          <h1 className="userDashboardHeaderTitle">User VMS Dashboard</h1>
          <div className="userDashboardUserSection">
            <div
              className="userDashboardNotificationIcon"
              onClick={handleNotificationClick}
            >
              <Mail size={18} className="userDashboardMailIcon" />
              {hasNewNotifications && <div className="userDashboardNotificationDot"></div>}
            </div>

            {userData ? (
              <div
                className="userDashboardUserProfile"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                ref={profileDropdownRef}
              >
                <div
                  className="userDashboardAvatar"
                  style={{ backgroundColor: profileColor }}
                >
                  {userData.profileImage ? (
                    <img src={userData.profileImage} alt="Profile" />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <div className="userDashboardUserInfo">
                  <div className="userDashboardUserName">{displayName}</div>
                  <div className="userDashboardUserRole">
                    {userData.role === "user"
                      ? "Standard account"
                      : userData.role || "User"}
                  </div>
                </div>
                <ChevronDown size={14} color="#718096" />
                {showProfileDropdown && (
                  <div className="userDashboardProfileDropdown userDashboardShow">
                    <div
                      className="userDashboardDropdownItem"
                      onClick={() => setActiveMenu("Profile")}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </div>
                    <div
                      className="userDashboardDropdownItem"
                      onClick={() => {
                        setActiveMenu("Profile");
                        SessionManager.setItem("profileActiveTab", "settings");
                      }}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </div>
                    <div className="userDashboardDropdownItem">
                      <HelpCircle size={16} />
                      <span>Support</span>
                    </div>
                    <div
                      className="userDashboardDropdownItem userDashboardLogout"
                      onClick={handleLogout}
                    >
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
        <div className="userDashboardContentWrapper">
          {activeMenu === "Overview" && <UserOverview />}
          {activeMenu === "Profile" && <Profile />}
          {activeMenu === "Become a Host" && <CreateHostProfile />}
          {activeMenu === "Notifications" && (
            <Notifications notifications={notifications} />
          )}
          {activeMenu === "My Visitation" && <MyVisitation />}
          {activeMenu === "Appointment" && <AppointmentConfirmation />}
          {activeMenu === "Host Directory" && <HostDirectory />}
          {/* Add other menu components as needed */}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;