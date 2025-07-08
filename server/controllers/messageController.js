
const Message = require('../models/Message'); // Legacy model
const MessageModel = require('../models/MessageModel'); // MongoDB model
const RoomModel = require('../models/RoomModel'); // MongoDB model
const { getRoom } = require('../utils/roomManager');

const handleSendMessage = async (socket, io, data) => {
  try {
    const { content, roomId, sender } = data;
    
    // Create MongoDB message
    const newMessage = new MessageModel({
      content,
      sender: sender.id || sender._id,
      roomId
    });
    
    await newMessage.save();
    
    // Also create in-memory message for backward compatibility
    const message = Message.createMessage({
      id: newMessage._id.toString(),
      content,
      sender,
      roomId
    });
    
    const room = getRoom(roomId);
    if (room) {
      room.addMessage(message);
      
      // Populate the MongoDB message with sender details
      const populatedMessage = await MessageModel.findById(newMessage._id)
        .populate('sender', 'username')
        .populate('roomId', 'name');
      
      // Broadcast message to all users in the room
      io.to(roomId).emit('new_message', {
        id: populatedMessage._id,
        content: populatedMessage.content,
        sender: populatedMessage.sender,
        roomId: populatedMessage.roomId,
        timestamp: populatedMessage.createdAt,
        reactions: populatedMessage.reactions
      });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
};

const handleAddReaction = async (socket, io, data) => {
  try {
    const { messageId, emoji, userId, roomId } = data;
    
    // Update MongoDB message
    const dbMessage = await MessageModel.findById(messageId);
    if (dbMessage) {
      // Get current reactions for this emoji or initialize empty array
      let reactions = dbMessage.reactions.get(emoji) || [];
      
      // Toggle user's reaction
      const userIndex = reactions.indexOf(userId);
      if (userIndex === -1) {
        reactions.push(userId);
      } else {
        reactions.splice(userIndex, 1);
      }
      
      // Update reactions in the message
      if (reactions.length > 0) {
        dbMessage.reactions.set(emoji, reactions);
      } else {
        dbMessage.reactions.delete(emoji);
      }
      
      await dbMessage.save();
      
      // Also update in-memory message for backward compatibility
      const room = getRoom(roomId);
      if (room) {
        const message = room.messages.find(msg => msg.id === messageId);
        if (message) {
          message.addReaction(emoji, userId);
        }
      }
      
      io.to(roomId).emit('reaction_updated', {
        messageId,
        reactions: dbMessage.reactions
      });
    }
  } catch (error) {
    console.error('Error handling reaction:', error);
    socket.emit('error', { message: 'Failed to add reaction' });
  }
};

module.exports = {
  handleSendMessage,
  handleAddReaction
};
