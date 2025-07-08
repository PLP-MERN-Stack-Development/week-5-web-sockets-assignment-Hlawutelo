const express = require('express');
const router = express.Router();
const RoomModel = require('../models/RoomModel');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await RoomModel.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single room
router.get('/:id', async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a room
router.post('/', async (req, res) => {
  const room = new RoomModel({
    name: req.body.name,
    description: req.body.description
  });

  try {
    const newRoom = await room.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a room
router.patch('/:id', async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (req.body.name) room.name = req.body.name;
    if (req.body.description) room.description = req.body.description;
    
    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add user to room
router.post('/:id/users', async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    const userId = req.body.userId;
    if (!room.users.includes(userId)) {
      room.users.push(userId);
      await room.save();
    }
    
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove user from room
router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    const userIndex = room.users.indexOf(req.params.userId);
    if (userIndex > -1) {
      room.users.splice(userIndex, 1);
      await room.save();
    }
    
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a room
router.delete('/:id', async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    await room.deleteOne();
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;