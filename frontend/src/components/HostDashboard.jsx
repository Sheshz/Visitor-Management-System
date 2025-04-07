import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Calendar, BarChart2, ChevronDown, Home, QrCode, Clock, Network, UserPlus, Menu } from 'lucide-react';
import "../CSS/HostDashboard.css"; // Import CSS

export default function HostDashboard() {
  const [activeItem, setActiveItem] = useState('Overview');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [hostData, setHostData] = useState({ name: 'Host', email: 'No email provided' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchHostData = async () => {
      setIsLoading(true);
      const hostToken = localStorage.getItem('hostToken');
      
      if (!hostToken) {
        navigate('/host-login');
        return;
      }
      
      try {
        const response = await fetch('http://localhost:5000/api/hosts/getHostDetails', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${hostToken}`, 
            'Content-Type': 'application/json' 
          },
          credentials: 'include', // Include cookies if needed
        });
        
        if (response.ok) {
          const data = await response.json();
          setHostData({ 
            name: data.host?.name || 'Host', 
            email: data.host?.email || 'No email provided' 
          });
          setError(null);
        } else {
          // If server responds with an error
          const errorData = await response.json();
          setError(errorData.message || 'Failed to load host data');
          
          // If unauthorized (token expired or invalid), redirect to login
          if (response.status === 401) {
            localStorage.removeItem('hostToken');
            navigate('/host-login');
          }
        }
      } catch (error) {
        console.error('Error fetching host data:', error);
        setError('Network error. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHostData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('hostToken');
    navigate('/host-login');
  };

  const navItems = [
    { name: 'Overview', icon: <Home size={18} /> }, 
    { name: 'New Visitor', icon: <UserPlus size={18} /> },
    { name: 'Visitation History', icon: <Clock size={18} /> }, 
    { name: 'Host Network', icon: <Network size={18} /> },
    { name: 'QR Code Scanner', icon: <QrCode size={18} /> }
  ];

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
        <button className="menu-toggle" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
          <Menu size={24} />
        </button>
        <nav>
          {navItems.map((item) => (
            <div key={item.name} className={`nav-item ${activeItem === item.name ? 'active' : ''}`} onClick={() => setActiveItem(item.name)}>
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
        <button className="logout" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="profile-section" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="avatar">{hostData.name[0]}</div>
            <div className="profile-info">
              <p className="profile-name">{hostData.name} <ChevronDown size={14} /></p>
              <p className="profile-email">{hostData.email}</p>
            </div>
          </div>
          
          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-item">
                <User size={16} />
                <span>Profile</span>
              </div>
              <div className="dropdown-item">
                <Settings size={16} />
                <span>Settings</span>
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </header>

        <div className="content-area">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}
          <h2>{activeItem}</h2>
          <p>Welcome to the {activeItem} section.</p>
          
          {activeItem === 'Overview' && (
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Today's Visitors</h3>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card">
                <h3>Total Visitors</h3>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card">
                <h3>Active QR Codes</h3>
                <p className="stat-value">0</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Additional CSS for new elements */}
      <style>
        {`
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f7fafc;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #4299e1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .profile-dropdown {
            position: absolute;
            top: 60px;
            right: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 200px;
            z-index: 10;
          }
          
          .dropdown-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            cursor: pointer;
          }
          
          .dropdown-item:hover {
            background-color: #f7fafc;
          }
          
          .dropdown-item span {
            margin-left: 12px;
          }
          
          .error-banner {
            background-color: #fff5f5;
            color: #e53e3e;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          
          .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 24px;
            margin-top: 24px;
          }
          
          .stat-card {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .stat-card h3 {
            margin: 0;
            color: #4a5568;
            font-size: 16px;
            font-weight: 500;
          }
          
          .stat-value {
            font-size: 32px;
            font-weight: 600;
            color: #2d3748;
            margin: 16px 0 0 0;
          }
        `}
      </style>
    </div>
  );
}