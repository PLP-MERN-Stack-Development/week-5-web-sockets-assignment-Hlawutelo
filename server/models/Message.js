
// Message model
class Message {
  constructor(id, content, sender, roomId) {
    this.id = id;
    this.content = content;
    this.sender = sender;
    this.roomId = roomId;
    this.timestamp = new Date();
    this.reactions = {};
  }
  
  static createMessage(messageData) {
    return new Message(
      messageData.id || Date.now().toString(),
      messageData.content,
      messageData.sender,
      messageData.roomId
    );
  }
  
  addReaction(emoji, userId) {
    if (!this.reactions[emoji]) {
      this.reactions[emoji] = [];
    }
    
    const index = this.reactions[emoji].indexOf(userId);
    if (index === -1) {
      this.reactions[emoji].push(userId);
    } else {
      this.reactions[emoji].splice(index, 1);
      if (this.reactions[emoji].length === 0) {
        delete this.reactions[emoji];
      }
    }
  }
  
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      sender: this.sender,
      roomId: this.roomId,
      timestamp: this.timestamp,
      reactions: this.reactions
    };
  }
}

module.exports = Message;
