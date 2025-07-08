import React from 'react';

const RoomList = ({ rooms, currentRoom, unreadCounts, onJoinRoom }) => {
  return (
    <ul className="room-list">
      {rooms.map((room) => (
        <li 
          key={room.id} 
          className={`room-item ${currentRoom === room.id ? 'active' : ''}`}
          onClick={() => onJoinRoom(room.id)}
        >
          <div className="room-name">{room.name}</div>
          <div className="room-meta">
            <span className="user-count">{room.userCount}</span>
            {unreadCounts[room.id] > 0 && (
              <span className="unread-badge">{unreadCounts[room.id]}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RoomList;