
import React from 'react';
import { SocketProvider, useSocket } from '@/contexts/SocketContext';
import AuthModal from '@/components/AuthModal';
import RoomList from '@/components/RoomList';
import ChatRoom from '@/components/ChatRoom';

const ChatApp: React.FC = () => {
  const { user, isConnected } = useSocket();

  if (!user) {
    return <AuthModal isOpen={true} />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-800 flex">
      <RoomList />
      <ChatRoom />
      
      {/* Connection status indicator */}
      <div className="fixed bottom-4 right-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm backdrop-blur-sm ${
          isConnected 
            ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
            : 'bg-red-500/20 text-red-300 border border-red-400/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-800">
        <ChatApp />
      </div>
    </SocketProvider>
  );
};

export default Index;
