// Create a new file: Notifications.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setNotifications(response.data);
        setLoading(false);
        
        // Mark notifications as read
        await axios.put('http://localhost:5000/api/notifications/mark-read', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="empty-notifications">
          <Bell size={40} strokeWidth={1} />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(notification => (
            <div key={notification._id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
              {!notification.read && <div className="unread-indicator" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;