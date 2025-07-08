import React from 'react';

const NotificationPanel = ({ notifications, onClose, onJoinRoom }) => {
  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button className="close-btn" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
      </div>
      
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">No new notifications</div>
        ) : (
          notifications.map((notification, index) => (
            <div key={index} className="notification-item">
              <div className="notification-content">
                {notification.isPrivate ? (
                  <p>
                    <strong>{notification.from}</strong> sent you a private message
                  </p>
                ) : (
                  <p>
                    <strong>{notification.from}</strong> in <span 
                      className="room-link"
                      onClick={() => onJoinRoom(notification.room)}
                    >
                      {notification.roomName}
                    </span>
                  </p>
                )}
                <p className="notification-preview">{notification.preview}</p>
              </div>
              <span className="notification-time">
                {formatTime(notification.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;