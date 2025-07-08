import React from 'react';

const MessageList = ({ messages, currentUser, onAddReaction }) => {
  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Reaction options
  const reactionOptions = ['👍', '❤️', '😂', '😮', '😢', '👏'];

  return (
    <div className="message-list">
      {messages.map((msg) => {
        const isOwnMessage = msg.sender === currentUser;
        
        return (
          <div 
            key={msg.id} 
            className={`message ${isOwnMessage ? 'own-message' : ''}`}
          >
            <div className="message-header">
              <span className="sender">{msg.sender}</span>
              <span className="timestamp">{formatTime(msg.timestamp)}</span>
            </div>
            
            <div className="message-content">
              {msg.isFile ? (
                msg.fileType?.startsWith('image/') ? (
                  <img 
                    src={`http://localhost:5000${msg.fileUrl}`} 
                    alt={msg.filename} 
                    className="message-image"
                  />
                ) : (
                  <div className="file-attachment">
                    <span className="material-icons">attach_file</span>
                    <a 
                      href={`http://localhost:5000${msg.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {msg.filename}
                    </a>
                  </div>
                )
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
            
            {/* Reactions */}
            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
              <div className="message-reactions">
                {Object.entries(msg.reactions).map(([reaction, users]) => (
                  <div key={reaction} className="reaction">
                    <span className="reaction-emoji">{reaction}</span>
                    <span className="reaction-count">{users.length}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Read receipts */}
            {isOwnMessage && msg.read && Object.keys(msg.read).length > 0 && (
              <div className="read-receipts">
                Read by {Object.keys(msg.read).length}
              </div>
            )}
            
            {/* Reaction picker */}
            <div className="reaction-picker">
              {reactionOptions.map(emoji => (
                <button 
                  key={emoji} 
                  className="reaction-btn"
                  onClick={() => onAddReaction(msg.id, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;