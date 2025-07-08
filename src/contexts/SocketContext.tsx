
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  username: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  roomId: string;
  reactions?: { [emoji: string]: string[] };
}

interface Room {
  id: string;
  name: string;
  description?: string;
  unreadCount: number;
}

interface SocketContextType {
  socket: Socket | null;
  user: User | null;
  messages: Message[];
  rooms: Room[];
  currentRoom: string;
  onlineUsers: User[];
  typingUsers: string[];
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  sendMessage: (content: string) => void;
  setUser: (user: User) => void;
  setCurrentRoom: (roomId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  addReaction: (messageId: string, emoji: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'general', name: 'General', description: 'General discussion', unreadCount: 0 },
    { id: 'random', name: 'Random', description: 'Random conversations', unreadCount: 0 },
    { id: 'tech', name: 'Tech Talk', description: 'Technology discussions', unreadCount: 0 },
  ]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // For demo purposes, we'll simulate Socket.io behavior without a real server
    const mockSocket = {
      emit: (event: string, data?: any) => {
        console.log('Socket emit:', event, data);
        // Simulate server responses
        setTimeout(() => {
          if (event === 'send_message' && data) {
            const newMessage: Message = {
              id: Date.now().toString(),
              content: data.content,
              sender: user!,
              timestamp: new Date(),
              roomId: data.roomId,
            };
            setMessages(prev => [...prev, newMessage]);
          }
        }, 100);
      },
      on: () => {},
      off: () => {},
      disconnect: () => {},
    } as unknown as Socket;

    setSocket(mockSocket);
    setIsConnected(true);

    // Simulate some online users
    setOnlineUsers([
      { id: '1', username: 'Alice', isOnline: true },
      { id: '2', username: 'Bob', isOnline: true },
      { id: '3', username: 'Charlie', isOnline: false },
    ]);

    return () => {
      mockSocket.disconnect();
    };
  }, [user]);

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('join_room', roomId);
      setCurrentRoom(roomId);
      // Clear unread count for the room
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      ));
    }
  };

  const sendMessage = (content: string) => {
    if (socket && user && content.trim()) {
      socket.emit('send_message', {
        content: content.trim(),
        roomId: currentRoom,
      });
    }
  };

  const startTyping = () => {
    if (socket && user) {
      socket.emit('start_typing', { roomId: currentRoom });
    }
  };

  const stopTyping = () => {
    if (socket && user) {
      socket.emit('stop_typing', { roomId: currentRoom });
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (socket && user) {
      socket.emit('add_reaction', { messageId, emoji });
      // Update local state optimistically
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {};
          const emojiReactions = reactions[emoji] || [];
          const hasReacted = emojiReactions.includes(user.id);
          
          if (hasReacted) {
            reactions[emoji] = emojiReactions.filter(id => id !== user.id);
          } else {
            reactions[emoji] = [...emojiReactions, user.id];
          }
          
          return { ...msg, reactions };
        }
        return msg;
      }));
    }
  };

  const value: SocketContextType = {
    socket,
    user,
    messages: messages.filter(msg => msg.roomId === currentRoom),
    rooms,
    currentRoom,
    onlineUsers,
    typingUsers,
    isConnected,
    joinRoom,
    sendMessage,
    setUser,
    setCurrentRoom,
    startTyping,
    stopTyping,
    addReaction,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
