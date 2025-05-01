import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { SessionManager } from "../utils/SessionManager";
import "../CSS/HostDashboard.css";

// Import icons for sidebar
import { 
  FaHome, 
  FaUser, 
  FaUserPlus, 
  FaNetworkWired, 
  FaHistory, 
  FaCalendarAlt, 
  FaCalendarCheck,
  FaCalendarWeek,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

// Import your existing pages
import Overview from "./hosts/HostOverview";
import HostProfile from "./hosts/HostProfile";
import NewVisitor from "./hosts/NewVisitor"; // Make sure this points to the correct component
import HostNetwork from "./hosts/HostNetwork";
import CreateMeeting from "./meeting/CreateMeetingPage";

const HostDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for host information
  const [hostInfo, setHostInfo] = useState({
    name: "",
    email: "",
    hostId: "",
    profileImage: ""
  });
  
  // State for mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for sidebar collapsed mode
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Determine active page based on URL path
  const getActivePageFromPath = (path) => {
    if (path === "/host-dashboard") return "overview";
    if (path.includes("/profile")) return "hostProfile";
    if (path.includes("/new-visitor")) return "newVisitor";
    if (path.includes("/network")) return "hostNetwork";
    if (path.includes("/history")) return "visitationHistory";
    if (path.includes("/meeting") && !path.includes("/meeting-history")) return "createMeeting";
    if (path.includes("/available-meetings")) return "availableMeetings";
    if (path.includes("/meeting-history")) return "meetingHistory";
    return "overview";
  };
  
  // State for current active page
  const [activePage, setActivePage] = useState(getActivePageFromPath(location.pathname));

  // Update active page when location changes
  useEffect(() => {
    setActivePage(getActivePageFromPath(location.pathname));
  }, [location.pathname]);

  // Load host information when component mounts
  useEffect(() => {
    const fetchHostInfo = async () => {
      try {
        // First try to get info from SessionManager
        const name = SessionManager.getItem("hostName") || localStorage.getItem("hostName");
        const email = SessionManager.getItem("hostEmail") || localStorage.getItem("gp_remember_email");
        const hostId = SessionManager.getItem("hostId") || localStorage.getItem("hostId");
        const profileImage = SessionManager.getItem("hostProfileImage") || localStorage.getItem("hostProfileImage");
        
        // Set initial information from storage
        setHostInfo({
          name: name || "Host User",
          email: email || "email@example.com",
          hostId: hostId || "Not available",
          profileImage: profileImage || ""
        });
        
        // If we have a token, fetch updated info from the server
        const hostToken = SessionManager.getHostToken() || localStorage.getItem("hostToken");
        
        if (hostToken) {
          console.log("Fetching host details with token:", hostToken);
          
          const response = await fetch("http://localhost:5000/api/hosts/getHostDetails", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${hostToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("API response data:", data);
            
            // Check for different possible field names in the API response
            const updatedEmail = data.email || data.hostEmail || data.userEmail || email;
            const updatedName = data.name || data.hostName || data.userName || name;
            const updatedHostId = data.hostId || data.id || hostId;
            const updatedProfileImage = data.avatar || data.profileImage || data.image || profileImage;
            
            // Update session storage with new data
            if (updatedEmail) SessionManager.setItem("hostEmail", updatedEmail);
            if (updatedName) SessionManager.setItem("hostName", updatedName);
            if (updatedHostId) SessionManager.setItem("hostId", updatedHostId);
            if (updatedProfileImage) SessionManager.setItem("hostProfileImage", updatedProfileImage);
            
            // Update local storage for persistence
            if (updatedEmail) localStorage.setItem("gp_remember_email", updatedEmail);
            if (updatedName) localStorage.setItem("hostName", updatedName);
            if (updatedHostId) localStorage.setItem("hostId", updatedHostId);
            if (updatedProfileImage) localStorage.setItem("hostProfileImage", updatedProfileImage);
            
            // Update state with the new data
            const updatedInfo = {
              name: updatedName,
              email: updatedEmail,
              hostId: updatedHostId,
              profileImage: updatedProfileImage
            };
            
            console.log("Updated host info:", updatedInfo);
            setHostInfo(updatedInfo);
          } else {
            console.error("Failed to fetch host details:", response.status);
            // Try to parse error message
            try {
              const errorData = await response.json();
              console.error("Error details:", errorData);
            } catch (e) {
              console.error("Could not parse error response");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching host information:", error);
      }
    };
    
    fetchHostInfo();
    
    // Check for user preference in localStorage
    const savedSidebarState = localStorage.getItem("sidebarCollapsed");
    if (savedSidebarState) {
      setSidebarCollapsed(savedSidebarState === "true");
    }
  }, []);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Handle logout
  const handleLogout = () => {
    // Clear tokens from localStorage and SessionManager
    SessionManager.logoutHost();
    localStorage.removeItem("hostToken");
    localStorage.removeItem("hostId");
    localStorage.removeItem("hostName");
    localStorage.removeItem("hostEmail");
    localStorage.removeItem("gp_remember_email");
    localStorage.removeItem("hostProfileImage");
    
    // Redirect to login page with logout parameter
    navigate("/host-login?logout=true");
  };

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Close sidebar on mobile when navigating
  const handleNavigation = (pageId) => {
    setActivePage(pageId);
    setSidebarOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Define sidebar navigation items
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <FaHome />, path: "/host-dashboard" },
    { id: "hostProfile", label: "Host Profile", icon: <FaUser />, path: "/host-dashboard/profile" },
    { id: "newVisitor", label: "New Visitor", icon: <FaUserPlus />, path: "/host-dashboard/new-visitor" },
    { id: "hostNetwork", label: "Host Network", icon: <FaNetworkWired />, path: "/host-dashboard/network" },
    { id: "visitationHistory", label: "Visitation History", icon: <FaHistory />, path: "/host-dashboard/history" },
    { id: "createMeeting", label: "Create Meeting", icon: <FaCalendarAlt />, path: "/host-dashboard/meeting" },
    { id: "availableMeetings", label: "Scheduled Sessions", icon: <FaCalendarWeek />, path: "/host-dashboard/available-meetings" },
    { id: "meetingHistory", label: "Meeting History", icon: <FaCalendarCheck />, path: "/host-dashboard/meeting-history" }
  ];

  return (
    <div className={`host-dashboard-container ${sidebarCollapsed ? 'sidebar-closed' : ''}`}>
      {/* Mobile menu toggle button */}
      <button 
        className={`mobile-menu-toggle ${sidebarOpen ? 'menu-open' : ''}`} 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span className="menu-icon"></span>
      </button>

      {/* Sidebar navigation */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar toggle button */}
        <div 
          className="sidebar-toggle" 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </div>
        
        <div className="sidebar-header">
          <h1>GetePass Pro</h1>
          <div className="logo-small">GP</div>
          <div className="host-info-brief">
            <div className="host-avatar-small">
              {hostInfo.profileImage ? (
                <img src={hostInfo.profileImage} alt="Host Profile" />
              ) : (
                <div className="avatar-placeholder-small">
                  {hostInfo.name ? hostInfo.name.charAt(0).toUpperCase() : "H"}
                </div>
              )}
            </div>
            <div className="host-brief-details">
              <span className="host-name">{hostInfo.name}</span>
              <span className="host-role">Professional Host</span>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.id)}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </Link>
              </li>
            ))}
            <li className="sidebar-divider"></li>
            <li>
              <button 
                className="nav-item logout-button" 
                onClick={handleLogout}
                title={sidebarCollapsed ? "Logout" : ""}
              >
                <span className="icon"><FaSignOutAlt /></span>
                <span className="label">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content area */}
      <main className="dashboard-content">
        <div className="dashboard-header">
          <h2 className="page-title">
            {sidebarItems.find(item => item.id === activePage)?.label || 'Dashboard'}
          </h2>
          <div className="header-actions">
            <div className="host-welcome">
              Welcome, {hostInfo.name}
            </div>
          </div>
        </div>
        
        <div className="content-container">
          <Routes>
            <Route index element={<Overview hostInfo={hostInfo} />} />
            <Route path="profile" element={<HostProfile />} />
            <Route path="new-visitor" element={<NewVisitor />} />
            <Route path="network" element={<HostNetwork />} />
            <Route path="history" element={<div>Visitation History Page (Coming Soon)</div>} />
            <Route path="meeting" element={<CreateMeeting />} />
            <Route path="available-meetings" element={<div>Scheduled Sessions Page (Coming Soon)</div>} />
            <Route path="meeting-history" element={<div>Meeting History Page (Coming Soon)</div>} />
            {/* Add a route for appointment details */}
            <Route path="appointment/:appointmentId" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                {/* Dynamically import the detailed appointment view */}
                {React.createElement(React.lazy(() => import('./appointment/AppointmentDetails')))}
              </React.Suspense>
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default HostDashboard;