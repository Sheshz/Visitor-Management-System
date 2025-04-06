// components/Notifications.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Use the correct endpoint path as defined in your routes
        const response = await axios.get('http://localhost:5000/api/notifications/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setNotifications(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the local state to mark notification as read
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading notifications...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="notifications-container p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="empty-notifications text-center py-8">
          <Bell size={40} strokeWidth={1} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="notification-list space-y-3">
          {notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item p-3 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className="notification-content">
                <p className="text-sm mb-1">{notification.content}</p>
                <div className="flex justify-between items-center">
                  <span className="notification-time text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  {notification.relatedTo && (
                    <span className="text-xs text-gray-600">
                      Related to: {notification.relatedTo.fullName}
                    </span>
                  )}
                </div>
              </div>
              {!notification.read && (
                <div className="unread-indicator w-2 h-2 rounded-full bg-blue-500 absolute top-3 right-3" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;