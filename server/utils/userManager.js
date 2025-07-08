
class UserManager {
  constructor() {
    this.users = new Map();
  }
  
  addUser(user) {
    this.users.set(user.id, user);
  }
  
  removeUser(userId) {
    this.users.delete(userId);
  }
  
  getUser(userId) {
    return this.users.get(userId);
  }
  
  getOnlineUsers() {
    return Array.from(this.users.values()).map(user => user.toJSON());
  }
  
  getUserBySocketId(socketId) {
    return Array.from(this.users.values()).find(user => user.socketId === socketId);
  }
}

const userManager = new UserManager();

const getUserManager = () => userManager;

module.exports = {
  getUserManager
};
