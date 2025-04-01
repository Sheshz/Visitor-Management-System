import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Users, Bell, Clock, Calendar } from 'lucide-react'; // Update icon import
import axios from 'axios';
import { UserGroupIcon, CalendarIcon, ClockIcon, BellIcon } from '@heroicons/react/outline';  // Fixed icon imports
import "../CSS/Overview.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Overview = () => {
  // State variables
  const [visitorStats, setVisitorStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visitorData, setVisitorData] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch visitor statistics
        const statsResponse = await axios.get('http://localhost:5000/api/statistics/visitors', { headers });
        setVisitorStats(statsResponse.data);
        
        // Fetch notifications
        const notificationsResponse = await axios.get('http://localhost:5000/api/notifications/recent', { headers });
        setNotifications(notificationsResponse.data);
        
        // Fetch available hosts
        const hostsResponse = await axios.get('http://localhost:5000/api/hosts/available', { headers });
        setHosts(hostsResponse.data);
        
        // Fetch recent visitors
        const visitorsResponse = await axios.get('http://localhost:5000/api/visitors/recent', { headers });
        setRecentVisitors(visitorsResponse.data);
        
        // Fetch current visitor data if available
        const currentVisitorResponse = await axios.get('http://localhost:5000/api/visitors/current', { headers });
        setVisitorData(currentVisitorResponse.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error.response?.data || error.message);
        // Initialize with empty data in case of error
        setVisitorStats({
          totalVisitors: 0,
          todayAppointments: 0,
          checkedIn: 0,
          weeklyLabels: [],
          weeklyData: [],
          visitorTypes: [0, 0, 0, 0]
        });
        setNotifications([]);
        setHosts([]);
        setRecentVisitors([]);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const visitorChartData = {
    labels: visitorStats?.weeklyLabels || [],
    datasets: [
      {
        label: 'Visitors This Week',
        data: visitorStats?.weeklyData || [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const visitorTypeData = {
    labels: ['Appointments', 'Walk-ins', 'Deliveries', 'Interviews'],
    datasets: [
      {
        label: 'Visitor Types',
        data: visitorStats?.visitorTypes || [0, 0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
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
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Visitor Traffic',
      },
    },
  };

  if (isLoading) {
    return <div className="loading">Loading dashboard data...</div>;
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
            <UserGroupIcon />
          </div>
          <div className="card-details">
            <h3>Total Visitors</h3>
            <p className="card-value">{visitorStats?.totalVisitors || 0}</p>
            <p className="card-period">Today</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon appointments">
            <CalendarIcon />
          </div>
          <div className="card-details">
            <h3>Appointments</h3>
            <p className="card-value">{visitorStats?.todayAppointments || 0}</p>
            <p className="card-period">Today</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon pending">
            <ClockIcon />
          </div>
          <div className="card-details">
            <h3>Check-ins</h3>
            <p className="card-value">{visitorStats?.checkedIn || 0}</p>
            <p className="card-period">Active</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon notifications">
            <BellIcon />
          </div>
          <div className="card-details">
            <h3>Notifications</h3>
            <p className="card-value">{notifications.length}</p>
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
            <Pie data={visitorTypeData} options={{maintainAspectRatio: false}} />
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
            {hosts.length > 0 ? (
              hosts.map(host => (
                <div key={host._id} className="host-item">
                  <div className="host-avatar">
                    {host.profileImage ? (
                      <img src={host.profileImage} alt={host.name} />
                    ) : (
                      <span>{host.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="host-info">
                    <h3>{host.name}</h3>
                    <p>{host.bio}</p>
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
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  <p>{notification.message}</p>
                  <small>{new Date(notification.timestamp).toLocaleString()}</small>
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

export default Overview;
