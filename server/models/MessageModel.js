const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  reactions: {
    type: Map,
    of: [String],
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);