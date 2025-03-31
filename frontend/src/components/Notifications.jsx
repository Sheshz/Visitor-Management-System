function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
  
    useEffect(() => {
      fetchNotifications();
    }, []);
  
    const fetchNotifications = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");
  
      try {
        const response = await fetch("http://localhost:5000/api/notifications", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
          setUnreadCount(data.filter(notification => !notification.read).length);
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
  
    const markAsRead = async (notificationId) => {
      const token = localStorage.getItem("authToken");
  
      try {
        const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          setNotifications(notifications.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true } 
              : notification
          ));
          setUnreadCount(prev => prev - 1);
        }
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    };
  
    const markAllAsRead = async () => {
      const token = localStorage.getItem("authToken");
  
      try {
        const response = await fetch("http://localhost:5000/api/notifications/mark-all-read", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          setNotifications(notifications.map(notification => ({ ...notification, read: true })));
          setUnreadCount(0);
        }
      } catch (err) {
        console.error("Error marking all notifications as read:", err);
      }
    };
  
    const formatNotificationTime = (timestamp) => {
      const now = new Date();
      const notificationTime = new Date(timestamp);
      const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
      
      return notificationTime.toLocaleDateString();
    };
  
    const getNotificationIcon = (type) => {
      switch (type) {
        case "meeting_request":
          return "📅";
        case "meeting_accepted":
          return "✅";
        case "meeting_cancelled":
          return "❌";
        case "system":
          return "🔔";
        default:
          return "📌";
      }
    };
  
    if (loading) return <LoadingSpinner />;
  
    // If no actual data is available, use this sample data
    const sampleNotifications = [
      {
        _id: "1",
        type: "meeting_accepted",
        title: "Meeting Request Accepted",
        message: "Michael Chen has accepted your meeting request for tomorrow at 10:00 AM.",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        actionData: { meetingId: "m123" }
      },
      {
        _id: "2",
        type: "system",
        title: "Welcome to GetePass Pro",
        message: "Thank you for joining GetePass Pro! Start by exploring our host directory.",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionData: null
      },
      {
        _id: "3",
        type: "meeting_request",
        title: "New Meeting Request",
        message: "Jessica Williams is requesting a meeting on Friday at 2:30 PM.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionData: { requestId: "r456" }
      }
    ];
  
    const displayNotifications = notifications.length > 0 ? notifications : sampleNotifications;
    const displayUnreadCount = unreadCount > 0 ? unreadCount : (sampleNotifications.filter(n => !n.read).length);
  
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-title">
            <h2>Notifications</h2>
            {displayUnreadCount > 0 && (
              <span className="unread-badge">{displayUnreadCount}</span>
            )}
          </div>
          {displayUnreadCount > 0 && (
            <button className="mark-all-read" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>
  
        {displayNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔔</div>
            <p>You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {displayNotifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`notification-item ${!notification.read ? "unread" : ""}`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.actionData && (
                    <div className="notification-actions">
                      {notification.type === "meeting_request" && (
                        <>
                          <button className="action-button accept">Accept</button>
                          <button className="action-button decline">Decline</button>
                        </>
                      )}
                      {notification.type === "meeting_accepted" && (
                        <button className="action-button view">View Details</button>
                      )}
                    </div>
                  )}
                </div>
                {!notification.read && (
                  <div className="unread-indicator"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  export default Notifications;