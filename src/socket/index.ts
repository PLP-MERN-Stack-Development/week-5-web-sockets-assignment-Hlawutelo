
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketClient {
  private socket: Socket | null = null;
  
  connect(userId: string) {
    this.socket = io(SOCKET_URL, {
      auth: {
        userId
      }
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  getSocket() {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
export default socketClient;
