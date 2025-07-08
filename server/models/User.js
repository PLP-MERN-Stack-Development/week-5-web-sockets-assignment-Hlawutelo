
// User model
class User {
  constructor(id, username, socketId) {
    this.id = id;
    this.username = username;
    this.socketId = socketId;
    this.isOnline = true;
    this.joinedAt = new Date();
  }
  
  static createUser(userData) {
    return new User(
      userData.id,
      userData.username,
      userData.socketId
    );
  }
  
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      isOnline: this.isOnline,
      joinedAt: this.joinedAt
    };
  }
}

module.exports = User;
