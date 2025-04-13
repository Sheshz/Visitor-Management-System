import React, { useEffect, useState } from "react";

const Overview = ({ hostInfo }) => {
  const [loaded, setLoaded] = useState(false);
  
  // Add effect to log hostInfo for debugging
  useEffect(() => {
    console.log("HostOverview received hostInfo:", hostInfo);
    setLoaded(true);
  }, [hostInfo]);

  return (
    <div className="dashboard-content-section">
      <div className="host-info-card">
        <div className="host-profile-header">
          <div className="host-avatar">
            {hostInfo.profileImage ? (
              <img 
                src={hostInfo.profileImage} 
                alt="Host Profile" 
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `
                    <div class="avatar-placeholder">
                      ${hostInfo.name ? hostInfo.name.charAt(0).toUpperCase() : "H"}
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="avatar-placeholder">
                {hostInfo.name ? hostInfo.name.charAt(0).toUpperCase() : "H"}
              </div>
            )}
          </div>
          <div className="host-details">
            <h3>Welcome, {hostInfo.name || "Host"}</h3>
            <p className="host-status">Professional Host</p>
          </div>
        </div>
        
        <div className="host-info-details">
          <div className="info-item">
            <span className="info-label">Host ID:</span>
            <span className="info-value">{hostInfo.hostId || "Not Available"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{hostInfo.email || "Not Available"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Account Status:</span>
            <span className="info-value status-active">Active</span>
          </div>
        </div>
        
        {loaded ? (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Today's Visitors</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Pending Meetings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Visitors</div>
            </div>
          </div>
        ) : (
          <div className="loading-stats">Loading statistics...</div>
        )}
      </div>
    </div>
  );
};

export default Overview;