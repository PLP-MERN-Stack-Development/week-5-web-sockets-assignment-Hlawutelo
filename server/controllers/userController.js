
const User = require('../models/User'); // Legacy model
const UserModel = require('../models/UserModel'); // MongoDB model
const { getUserManager } = require('../utils/userManager');

const handleUserJoin = async (socket, io, userData) => {
  try {
    // First, check if user exists in MongoDB
    let user = await UserModel.findOne({ username: userData.username });
    
    if (!user) {
      // Create new user if not exists
      user = new UserModel({
        username: userData.username,
        socketId: socket.id,
        isOnline: true
      });
      await user.save();
    } else {
      // Update existing user
      user.socketId = socket.id;
      user.isOnline = true;
      await user.save();
    }
    
    // Also update in-memory user for backward compatibility
    const memoryUser = User.createUser({
      ...userData,
      id: user._id.toString(),
      socketId: socket.id
    });
    
    const userManager = getUserManager();
    userManager.addUser(memoryUser);
    
    socket.userId = user._id.toString();
    socket.username = user.username;
    
    // Broadcast user joined
    io.emit('user_joined', {
      id: user._id,
      username: user.username,
      isOnline: user.isOnline,
      joinedAt: user.joinedAt
    });
    
    // Send current online users
    const onlineUsers = await UserModel.find({ isOnline: true });
    socket.emit('online_users', onlineUsers);
    
    console.log(`User ${user.username} joined`);
  } catch (error) {
    console.error('Error handling user join:', error);
    socket.emit('error', { message: 'Failed to join' });
  }
};

const handleUserDisconnect = async (socket, io) => {
  try {
    if (socket.userId) {
      // Update MongoDB user
      const user = await UserModel.findById(socket.userId);
      if (user) {
        user.isOnline = false;
        user.socketId = null;
        await user.save();
        
        // Also update in-memory user for backward compatibility
        const userManager = getUserManager();
        const memoryUser = userManager.getUser(socket.userId);
        
        if (memoryUser) {
          userManager.removeUser(socket.userId);
          io.emit('user_left', {
            id: user._id,
            username: user.username,
            isOnline: false,
            joinedAt: user.joinedAt
          });
          console.log(`User ${user.username} disconnected`);
        }
      }
    }
  } catch (error) {
    console.error('Error handling user disconnect:', error);
  }
};

module.exports = {
  handleUserJoin,
  handleUserDisconnect
};
