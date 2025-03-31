import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Settings, Calendar, BarChart2, ChevronDown, Home, QrCode, Clock, Network, UserPlus, Menu } from 'lucide-react';
import "../CSS/HostDashboard.css"; // Import CSS

export default function HostDashboard() {
  const [activeItem, setActiveItem] = useState('Overview');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [hostData, setHostData] = useState({ name: 'Host', email: 'No email provided' });
  
  useEffect(() => {
    const fetchHostData = async () => {
      const hostToken = localStorage.getItem('hostToken');
      if (hostToken) {
        try {
          const response = await fetch('http://localhost:5000/api/hosts/getHostDetails', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${hostToken}`, 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            const data = await response.json();
            setHostData({ name: data.host?.name || 'Host', email: data.host?.email || 'No email provided' });
          }
        } catch (error) {
          console.error('Error fetching host data:', error);
        }
      }
    };
    fetchHostData();
  }, []);

  const navItems = [
    { name: 'Overview', icon: <Home size={18} /> }, 
    { name: 'New Visitor', icon: <UserPlus size={18} /> },
    { name: 'Visitation History', icon: <Clock size={18} /> }, 
    { name: 'Host Network', icon: <Network size={18} /> },
    { name: 'QR Code Scanner', icon: <QrCode size={18} /> }
  ];

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
        <button className="logout">
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
        </header>

        <div className="content-area">
          <h2>{activeItem}</h2>
          <p>Welcome to the {activeItem} section.</p>
        </div>
      </main>
    </div>
  );
}
