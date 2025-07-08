
// Import MongoDB models
const UserModel = require('../models/UserModel');
const MessageModel = require('../models/MessageModel');
const RoomModel = require('../models/RoomModel');

// Import controllers
const { handleSendMessage, handleAddReaction } = require('../controllers/messageController');
const { handleUserJoin, handleUserDisconnect } = require('../controllers/userController');
const { handleJoinRoom, handleLeaveRoom, handleTyping } = require('../utils/roomManager');

const handleConnection = (socket, io) => {
  console.log('New client connected:', socket.id);
  
  // User events
  socket.on('user_join', (userData) => {
    handleUserJoin(socket, io, userData);
  });
  
  // Room events
  socket.on('join_room', (roomId) => {
    handleJoinRoom(socket, roomId);
  });
  
  socket.on('leave_room', (roomId) => {
    handleLeaveRoom(socket, roomId);
  });
  
  // Message events
  socket.on('send_message', (data) => {
    handleSendMessage(socket, io, data);
  });
  
  socket.on('add_reaction', (data) => {
    handleAddReaction(socket, io, data);
  });
  
  // Typing events
  socket.on('start_typing', (data) => {
    handleTyping(socket, data, true);
  });
  
  socket.on('stop_typing', (data) => {
    handleTyping(socket, data, false);
  });
  
  // Disconnect event
  socket.on('disconnect', () => {
    handleUserDisconnect(socket, io);
  });
};

module.exports = {
  handleConnection
};
