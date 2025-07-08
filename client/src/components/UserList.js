import React from 'react';

const UserList = ({ users, currentUser, privateRecipient, onSelectUser }) => {
  return (
    <ul className="user-list">
      {users.map((user, index) => (
        <li key={index} className={`user-item ${user.status}`}>
          <div className="user-info">
            <span className={`status-dot ${user.status}`}></span>
            <span className="username">{user.username}</span>
            {user.status === 'offline' && (
              <span className="last-seen">
                {new Date(user.lastSeen).toLocaleTimeString()}
              </span>
            )}
          </div>
          {user.username !== currentUser && (
            <button
              className={`private-chat-btn ${privateRecipient === user.username ? 'active' : ''}`}
              onClick={() => onSelectUser(user.username)}
            >
              Message
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default UserList;