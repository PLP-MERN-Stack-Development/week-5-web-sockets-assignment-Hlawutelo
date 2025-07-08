// Room model
class Room {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.users = new Set();
    this.messages = [];
    this.createdAt = new Date();
  }
  
  addUser(userId) {
    this.users.add(userId);
  }
  
  removeUser(userId) {
    this.users.delete(userId);
  }
  
  addMessage(message) {
    this.messages.push(message);
    // Keep only last 100 messages
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      userCount: this.users.size,
      createdAt: this.createdAt
    };
  }
}

module.exports = Room;
