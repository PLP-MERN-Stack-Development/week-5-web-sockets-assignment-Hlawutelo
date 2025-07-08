import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import useSound from 'use-sound';

// Socket.io connection URL
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Create context
const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notifications, setNotifications] = useState([]);
  
  // Sound effects
  const [playMessageSound] = useSound('/sounds/message.mp3', { volume: 0.5 });
  const [playNotificationSound] = useSound('/sounds/notification.mp3', { volume: 0.5 });

  // Connect to socket server
  const connect = (username) => {
    if (!username) return;
    
    socket.connect();
    setUser({ username });
    socket.emit('user_join', username);
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
    setUser(null);
    setMessages([]);
  };

  // Send a message
  const sendMessage = (text, room = currentRoom, to = null) => {
    if (!text.trim()) return;
    
    const messageData = {
      text,
      room,
      to,
      timestamp: new Date().toISOString(),
    };
    
    socket.emit('send_message', messageData);
    socket.emit('stop_typing', { room, isTyping: false });
  };

  // Upload a file
  const uploadFile = (file, room = currentRoom) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract base64 data
        const base64Data = reader.result.split(',')[1];
        
        socket.emit('upload_file', {
          room,
          filename: file.name,
          file: base64Data,
          fileType: file.type
        });
        
        socket.once('upload_success', (data) => {
          resolve(data.fileUrl);
        });
        
        socket.once('upload_error', (error) => {
          reject(error);
        });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Join a room
  const joinRoom = (room) => {
    if (room === currentRoom) return;
    
    socket.emit('join_room', { room, previousRoom: currentRoom });
    setCurrentRoom(room);
    setMessages([]);
  };

  // Create a new room
  const createRoom = (roomName) => {
    socket.emit('create_room', roomName);
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', { room: currentRoom, isTyping });
  };

  // Mark message as read
  const markAsRead = (messageId) => {
    socket.emit('mark_read', { messageId, room: currentRoom });
  };

  // Add reaction to message
  const addReaction = (messageId, reaction) => {
    socket.emit('add_reaction', { messageId, room: currentRoom, reaction });
  };

  // Update user status
  const updateStatus = (status) => {
    socket.emit('update_status', status);
  };

  // Request unread message count
  const getUnreadCount = () => {
    socket.emit('get_unread_count');
  };

  // Socket event listeners
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('Connected to server');
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('Disconnected from server');
    }

    function onReceiveMessage(message) {
      setMessages((prev) => [...prev, message]);
      
      // Play sound if message is not from current user
      if (message.sender !== user?.username) {
        playMessageSound();
      }
      
      // Mark as read if in current room
      if (message.room === currentRoom) {
        setTimeout(() => {
          markAsRead(message.id);
        }, 1000);
      }
    }

    function onRoomHistory(data) {
      setMessages(data.messages);
    }

    function onUserList(userList) {
      setUsers(userList);
    }

    function onRoomList(roomList) {
      setRooms(roomList);
    }

    function onTypingUsers(data) {
      setTypingUsers(prev => ({
        ...prev,
        [data.room]: data.users
      }));
    }

    function onUnreadCount(counts) {
      setUnreadCounts(counts);
    }

    function onNewMessageNotification(notification) {
      // Add to notifications list
      setNotifications(prev => [notification, ...prev].slice(0, 50));
      
      // Play notification sound
      playNotificationSound();
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Message', {
          body: `${notification.from}: ${notification.preview}`,
          icon: '/logo192.png'
        });
      }
    }

    function onMessageReaction(data) {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, reactions: data.reactions } 
          : msg
      ));
    }

    function onMessageRead(data) {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, read: { ...msg.read, [data.username]: data.timestamp } } 
          : msg
      ));
    }

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('room_history', onRoomHistory);
    socket.on('user_list', onUserList);
    socket.on('room_list', onRoomList);
    socket.on('typing_users', onTypingUsers);
    socket.on('unread_count', onUnreadCount);
    socket.on('new_message_notification', onNewMessageNotification);
    socket.on('message_reaction', onMessageReaction);
    socket.on('message_read', onMessageRead);

    // Request browser notification permission
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('room_history', onRoomHistory);
      socket.off('user_list', onUserList);
      socket.off('room_list', onRoomList);
      socket.off('typing_users', onTypingUsers);
      socket.off('unread_count', onUnreadCount);
      socket.off('new_message_notification', onNewMessageNotification);
      socket.off('message_reaction', onMessageReaction);
      socket.off('message_read', onMessageRead);
    };
  }, [user, currentRoom, playMessageSound, playNotificationSound]);

  // Request unread counts when connected
  useEffect(() => {
    if (isConnected) {
      getUnreadCount();
    }
  }, [isConnected]);

  // Update online status when window focus changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isConnected) {
        updateStatus(document.hidden ? 'away' : 'online');
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected]);

  // Reconnection logic
  useEffect(() => {
    let reconnectTimer;

    const handleReconnect = () => {
      if (user && !isConnected) {
        console.log('Attempting to reconnect...');
        socket.connect();
        
        // Re-join with username after reconnection
        socket.once('connect', () => {
          socket.emit('user_join', user.username);
          socket.emit('join_room', { room: currentRoom, previousRoom: null });
        });
      }
    };

    if (user && !isConnected) {
      reconnectTimer = setInterval(handleReconnect, 5000);
    }

    return () => {
      clearInterval(reconnectTimer);
    };
  }, [user, isConnected, currentRoom]);

  const value = {
    socket,
    isConnected,
    user,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    unreadCounts,
    notifications,
    connect,
    disconnect,
    sendMessage,
    uploadFile,
    joinRoom,
    createRoom,
    setTyping,
    markAsRead,
    addReaction,
    updateStatus,
    getUnreadCount,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};