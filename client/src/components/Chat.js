import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket/socket';
import '../styles/ModernChat.css';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [privateRecipient, setPrivateRecipient] = useState('');
  const [rooms, setRooms] = useState(['general', 'random', 'tech']);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [newRoom, setNewRoom] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const messageEndRef = useRef(null);
  const audioRef = useRef(null);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }
    
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  };

  useEffect(() => {
    if (!joined) return;
    
    socket.connect();
    socket.emit('user_join', username);

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      
      // Play sound notification for new messages
      if (audioRef.current && msg.sender !== username) {
        audioRef.current.play().catch(e => console.error('Error playing sound:', e));
      }
      
      // Show browser notification for private messages or mentions
      if (notificationsEnabled && 
          (msg.to === username || 
           (msg.text && msg.text.includes(`@${username}`)) || 
           msg.sender !== username)) {
        new Notification('New Message', {
          body: `${msg.sender}: ${msg.text}`,
          icon: '/notification-icon.png'
        });
      }
    });
    
    socket.on('user_list', (userList) => {
      setUsers(userList);
    });
    
    socket.on('typing', (user) => {
      setTypingUsers((prev) => [...new Set([...prev, user])]);
    });
    
    socket.on('stop_typing', (user) => {
      setTypingUsers((prev) => prev.filter(u => u !== user));
    });
    
    socket.on('available_rooms', (availableRooms) => {
      setRooms(availableRooms);
    });
    
    socket.on('room_history', (roomMessages) => {
      setMessages(roomMessages);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_list');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('available_rooms');
      socket.off('room_history');
      socket.disconnect();
    };
  }, [joined, username, notificationsEnabled]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const msgObj = {
        text: message,
        sender: username,
        time: new Date().toLocaleTimeString(),
        to: privateRecipient || null,
        room: currentRoom,
      };
      
      socket.emit('send_message', msgObj);
      setMessage('');
      socket.emit('stop_typing', username);
      
      // Handle file upload if there's a file
      if (fileToUpload) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileMsg = {
            text: `Shared a file: ${fileToUpload.name}`,
            sender: username,
            time: new Date().toLocaleTimeString(),
            to: privateRecipient || null,
            room: currentRoom,
            file: {
              name: fileToUpload.name,
              type: fileToUpload.type,
              data: event.target.result
            }
          };
          socket.emit('send_message', fileMsg);
        };
        reader.readAsDataURL(fileToUpload);
        setFileToUpload(null);
      }
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (e.target.value) {
      socket.emit('typing', username);
    } else {
      socket.emit('stop_typing', username);
    }
  };

  const joinRoom = (room) => {
    socket.emit('join_room', room);
    setCurrentRoom(room);
    setPrivateRecipient('');
  };

  const createRoom = () => {
    if (newRoom.trim()) {
      socket.emit('create_room', newRoom);
      setNewRoom('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  if (!joined) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Enter Username</h2>
          <form onSubmit={e => { 
            e.preventDefault(); 
            if (username.trim()) {
              setJoined(true);
              requestNotificationPermission();
            } 
          }}>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="message-input"
            />
            <button type="submit" className="send-button">Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <audio ref={audioRef} src="/notification.mp3" />
      
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">NODE</div>
        
        <div className="users-section">
          <div className="users-title">Users:</div>
          <div className="user-list">
            {users.map((u, idx) => (
              <div 
                key={idx} 
                className={`user-item ${privateRecipient === u ? 'active' : ''}`}
                onClick={() => setPrivateRecipient(u !== username ? u : '')}
              >
                {u}
              </div>
            ))}
          </div>
        </div>
        
        <div className="leave-button" onClick={() => setJoined(false)}>Leave</div>
      </div>
      
      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="messages-container">
          {messages.map((msg, idx) => {
            // Only show messages for current room or private messages
            if (msg.system || 
                (msg.room === currentRoom && !msg.to) || 
                msg.to === username || 
                msg.sender === username) {
              return (
                <div 
                  key={idx} 
                  className={`message ${msg.sender === username ? 'message-sent' : 'message-received'}`}
                >
                  <div className="message-header">
                    <span className="message-sender">{msg.sender}</span>
                    <span className="message-time">{msg.time || new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                  <div className="message-content">
                    {msg.text}
                    
                    {/* Display file if present */}
                    {msg.file && (
                      <div className="message-file">
                        {msg.file.type.startsWith('image/') ? (
                          <img 
                            src={msg.file.data} 
                            alt={msg.file.name} 
                            style={{ maxWidth: '200px', maxHeight: '200px' }} 
                          />
                        ) : (
                          <div>
                            <a 
                              href={msg.file.data} 
                              download={msg.file.name}
                              style={{ color: 'white' }}
                            >
                              Download: {msg.file.name}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })}
          <div ref={messageEndRef} />
        </div>
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div className="message-input-container">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Message..."
            className="message-input"
          />
          <button onClick={sendMessage} className="send-button">Send Message</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
