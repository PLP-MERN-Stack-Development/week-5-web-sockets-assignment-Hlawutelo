
const Room = require('../models/Room'); // Legacy model
const RoomModel = require('../models/RoomModel'); // MongoDB model

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.initializeDefaultRooms();
  }
  
  async initializeDefaultRooms() {
    const defaultRooms = [
      { id: 'general', name: 'General', description: 'General discussion' },
      { id: 'random', name: 'Random', description: 'Random conversations' },
      { id: 'tech', name: 'Tech Talk', description: 'Technology discussions' }
    ];
    
    // Create in-memory rooms
    defaultRooms.forEach(roomData => {
      const room = new Room(roomData.id, roomData.name, roomData.description);
      this.rooms.set(room.id, room);
    });
    
    // Create MongoDB rooms if they don't exist
    try {
      for (const roomData of defaultRooms) {
        const existingRoom = await RoomModel.findOne({ name: roomData.name });
        if (!existingRoom) {
          const newRoom = new RoomModel({
            name: roomData.name,
            description: roomData.description
          });
          await newRoom.save();
          console.log(`Created MongoDB room: ${roomData.name}`);
        }
      }
    } catch (error) {
      console.error('Error initializing MongoDB rooms:', error);
    }
  }
  
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }
  
  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => room.toJSON());
  }
  
  createRoom(roomData) {
    const room = new Room(roomData.id, roomData.name, roomData.description);
    this.rooms.set(room.id, room);
    return room;
  }
}

const roomManager = new RoomManager();

const handleJoinRoom = async (socket, roomId) => {
  socket.join(roomId);
  
  // Update in-memory room
  const room = roomManager.getRoom(roomId);
  if (room && socket.userId) {
    room.addUser(socket.userId);
  }
  
  // Update MongoDB room
  try {
    const dbRoom = await RoomModel.findById(roomId);
    if (dbRoom && socket.userId) {
      if (!dbRoom.users.includes(socket.userId)) {
        dbRoom.users.push(socket.userId);
        await dbRoom.save();
      }
      
      socket.to(roomId).emit('user_joined_room', {
        userId: socket.userId,
        username: socket.username,
        roomId
      });
    }
  } catch (error) {
    console.error('Error updating MongoDB room:', error);
  }
};

const handleLeaveRoom = async (socket, roomId) => {
  socket.leave(roomId);
  
  // Update in-memory room
  const room = roomManager.getRoom(roomId);
  if (room && socket.userId) {
    room.removeUser(socket.userId);
  }
  
  // Update MongoDB room
  try {
    const dbRoom = await RoomModel.findById(roomId);
    if (dbRoom && socket.userId) {
      dbRoom.users = dbRoom.users.filter(id => id.toString() !== socket.userId);
      await dbRoom.save();
      
      socket.to(roomId).emit('user_left_room', {
        userId: socket.userId,
        username: socket.username,
        roomId
      });
    }
  } catch (error) {
    console.error('Error updating MongoDB room:', error);
  }
};

const handleTyping = (socket, data, isTyping) => {
  const { roomId } = data;
  socket.to(roomId).emit(isTyping ? 'user_typing' : 'user_stopped_typing', {
    userId: socket.userId,
    username: socket.username,
    roomId
  });
};

const getRoom = (roomId) => roomManager.getRoom(roomId);

module.exports = {
  roomManager,
  handleJoinRoom,
  handleLeaveRoom,
  handleTyping,
  getRoom
};
