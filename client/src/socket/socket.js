// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [rooms, setRooms] = useState(['general', 'random', 'tech']);
  const [currentRoom, setCurrentRoom] = useState('general');

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message, room = currentRoom) => {
    socket.emit('send_message', { text: message, room });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('send_message', { to, text: message });
  };

  // Join a room
  const joinRoom = (room) => {
    socket.emit('join_room', room);
    setCurrentRoom(room);
  };

  // Create a new room
  const createRoom = (roomName) => {
    socket.emit('create_room', roomName);
  };

  // Set typing status
  const setTyping = (isTyping) => {
    if (isTyping) {
      socket.emit('typing', users[socket.id]);
    } else {
      socket.emit('stop_typing', users[socket.id]);
    }
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    // Room events
    const onRoomHistory = (roomMessages) => {
      setMessages(roomMessages);
    };

    const onAvailableRooms = (availableRooms) => {
      setRooms(availableRooms);
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          text: `${user.username} joined ${user.room || 'the chat'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          text: `${user.username} left ${user.room || 'the chat'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('room_history', onRoomHistory);
    socket.on('available_rooms', onAvailableRooms);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing', onTypingUsers);
    socket.on('stop_typing', onTypingUsers);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('room_history', onRoomHistory);
      socket.off('available_rooms', onAvailableRooms);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing', onTypingUsers);
      socket.off('stop_typing', onTypingUsers);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    joinRoom,
    createRoom,
  };
};

export default socket;