const express = require('express');
const router = express.Router();
const MessageModel = require('../models/MessageModel');

// Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await MessageModel.find()
      .populate('sender', 'username')
      .populate('roomId', 'name');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages by room
router.get('/room/:roomId', async (req, res) => {
  try {
    const messages = await MessageModel.find({ roomId: req.params.roomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single message
router.get('/:id', async (req, res) => {
  try {
    const message = await MessageModel.findById(req.params.id)
      .populate('sender', 'username')
      .populate('roomId', 'name');
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a message
router.post('/', async (req, res) => {
  const message = new MessageModel({
    content: req.body.content,
    sender: req.body.sender,
    roomId: req.body.roomId
  });

  try {
    const newMessage = await message.save();
    const populatedMessage = await MessageModel.findById(newMessage._id)
      .populate('sender', 'username')
      .populate('roomId', 'name');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add reaction to message
router.post('/:id/reactions', async (req, res) => {
  try {
    const message = await MessageModel.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const { emoji, userId } = req.body;
    
    // Get current reactions for this emoji or initialize empty array
    let reactions = message.reactions.get(emoji) || [];
    
    // Toggle user's reaction
    const userIndex = reactions.indexOf(userId);
    if (userIndex === -1) {
      reactions.push(userId);
    } else {
      reactions.splice(userIndex, 1);
    }
    
    // Update reactions in the message
    if (reactions.length > 0) {
      message.reactions.set(emoji, reactions);
    } else {
      message.reactions.delete(emoji);
    }
    
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const message = await MessageModel.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;