import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../socket';
import './ModernChat.css';

// Constants
const TYPING_TIMEOUT = 3000;

const ModernChat = () => {
  // User state
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  
  // Chat state
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  
  // UI state
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [availableRooms, setAvailableRooms] = useState(['general', 'random', 'tech']);
  
  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Socket connection
  const { 
    socket, 
    isConnected,
    rooms,
    joinRoom,
    createRoom 
  } = useSocket();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    // Message handler
    const handleMessage = (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    // User list handler
    const handleUserList = (userList) => {
      if (Array.isArray(userList)) {
        setUsers(userList);
      }
    };

    // Typing indicator handler
    const handleTyping = (data) => {
      if (!data || !data.username) return;
      
      setIsTyping(true);
      setTypingUser(data.username);
      
      // Clear previous timeout if exists
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to clear typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingUser('');
      }, TYPING_TIMEOUT);
    };
    
    // Room list handler
    const handleRoomList = (roomList) => {
      if (Array.isArray(roomList)) {
        setAvailableRooms(roomList);
      }
    };

    // Register event listeners
    socket.on('receive_message', handleMessage);
    socket.on('user_list', handleUserList);
    socket.on('typing', handleTyping);
    socket.on('available_rooms', handleRoomList);

    // Clean up event listeners
    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('user_list', handleUserList);
      socket.off('typing', handleTyping);
      socket.off('available_rooms', handleRoomList);
      
      // Clear any pending timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket]);

  // Handle user joining the chat
  const handleJoin = useCallback((e) => {
    e.preventDefault();
    if (username.trim() === '') return;
    
    setJoined(true);
    if (socket) {
      socket.emit('join', { username, room: currentRoom });
      joinRoom(currentRoom);
    }
  }, [username, socket, currentRoom, joinRoom]);

  // Handle sending a message
  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    const newMessage = {
      username,
      content: message,
      time: new Date(),
      room: currentRoom
    };
    
    if (socket) {
      socket.emit('send_message', newMessage);
      
      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, newMessage]);
    }
    
    setMessage('');
  }, [message, username, socket, currentRoom]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!socket) return;
    
    socket.emit('typing', { 
      username, 
      room: currentRoom 
    });
  }, [socket, username, currentRoom]);
  
  // Handle room change
  const handleRoomChange = useCallback((roomName) => {
    if (!socket || roomName === currentRoom) return;
    
    // Leave current room and join new room
    joinRoom(roomName);
    setCurrentRoom(roomName);
    
    // Load messages for the selected room
    if (messages.length === 0 || !isConnected) {
      const roomMessages = sampleData.current.messages[roomName] || [];
      setMessages(roomMessages);
    }
  }, [socket, currentRoom, joinRoom, messages.length, isConnected]);
  
  // Handle creating a new room
  const handleCreateRoom = useCallback((roomName) => {
    if (!socket || !roomName || roomName.trim() === '') return;
    
    createRoom(roomName);
    setAvailableRooms(prev => [...prev, roomName]);
    handleRoomChange(roomName);
  }, [socket, createRoom, handleRoomChange]);

  // Sample data for demonstration purposes
  const sampleData = useRef({
    users: ['Alice', 'Bob', 'Charlie'],
    messages: {
      general: [
        { username: 'Alice', content: 'Hello everyone!', time: new Date(Date.now() - 3600000), room: 'general' },
        { username: 'Bob', content: 'Hi Alice, how are you?', time: new Date(Date.now() - 3000000), room: 'general' },
        { username: 'Charlie', content: 'Hey folks, what are we discussing today?', time: new Date(Date.now() - 2400000), room: 'general' },
        { username: 'Alice', content: 'I was thinking we could talk about the new project.', time: new Date(Date.now() - 1800000), room: 'general' },
      ],
      tech: [
        { username: 'Bob', content: 'Has anyone tried the new React 18 features?', time: new Date(Date.now() - 3200000), room: 'tech' },
        { username: 'Charlie', content: 'Yes! The concurrent rendering is amazing!', time: new Date(Date.now() - 2800000), room: 'tech' },
      ],
      random: [
        { username: 'Alice', content: 'I saw a great movie yesterday!', time: new Date(Date.now() - 4000000), room: 'random' },
        { username: 'Charlie', content: 'Which one?', time: new Date(Date.now() - 3900000), room: 'random' },
      ]
    }
  });

  // Set sample messages and users when the user joins and there are no existing messages
  useEffect(() => {
    if (joined && messages.length === 0) {
      // Add current user to sample users if not already included
      const updatedUsers = [...sampleData.current.users];
      if (!updatedUsers.includes(username)) {
        updatedUsers.push(username);
      }
      setUsers(updatedUsers);

      // Set messages for current room
      const roomMessages = sampleData.current.messages[currentRoom] || [];
      setMessages(roomMessages);
    }
  }, [joined, messages.length, username, currentRoom]);

  // Render login screen if not joined
  if (!joined) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleJoin}>
          <h2>Join the Chat</h2>
          <input
            type="text"
            className="login-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <div className="room-selection">
            <label htmlFor="room-select">Select Room:</label>
            <select 
              id="room-select"
              value={currentRoom}
              onChange={(e) => setCurrentRoom(e.target.value)}
              className="room-select"
            >
              {availableRooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="login-button">Join Chat</button>
        </form>
      </div>
    );
  }

  // Render main chat interface
  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Modern Chat</h3>
          <span className="connection-status">
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
        
        <div className="rooms-section">
          <h4>Rooms</h4>
          <ul className="room-list">
            {availableRooms.map((room) => (
              <li 
                key={room} 
                className={room === currentRoom ? 'active-room' : ''}
                onClick={() => handleRoomChange(room)}
              >
                # {room}
              </li>
            ))}
          </ul>
          <div className="create-room">
            <input 
              type="text" 
              placeholder="New room name" 
              className="room-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateRoom(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
        
        <div className="users-section">
          <h4>Online Users ({users.length})</h4>
          <ul className="user-list">
            {users.map((user, index) => (
              <li key={index} className={user === username ? 'current-user' : ''}>
                <span className="user-status">●</span>
                {user} {user === username ? '(You)' : ''}
              </li>
            ))}
          </ul>
        </div>
        
        <button className="leave-button" onClick={() => setJoined(false)}>Leave Chat</button>
      </div>
      
      <div className="main-chat">
        <div className="chat-header">
          <h3># {currentRoom}</h3>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-messages">No messages yet in #{currentRoom}. Start the conversation!</div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.username === username ? 'my-message' : ''}`}
              >
                <div className="message-header">
                  <span className="message-username">{msg.username}</span>
                  <span className="message-time">
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="typing-indicator">
              {typingUser} is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="message-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="message-input"
            placeholder={`Message #${currentRoom}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleTyping}
            autoFocus
          />
          <button type="submit" className="send-button">
            <span className="send-icon">➤</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModernChat;