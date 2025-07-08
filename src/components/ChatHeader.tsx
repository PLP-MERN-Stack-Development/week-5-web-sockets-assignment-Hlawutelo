
import React from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Hash, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatHeader: React.FC = () => {
  const { rooms, currentRoom, onlineUsers, user } = useSocket();
  
  const currentRoomData = rooms.find(room => room.id === currentRoom);
  const onlineCount = onlineUsers.filter(u => u.isOnline).length;

  return (
    <div className="border-b border-gray-700 p-4 bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-gray-400" />
            <h1 className="text-white font-semibold text-lg">
              {currentRoomData?.name || 'Unknown Room'}
            </h1>
          </div>
          
          {currentRoomData?.description && (
            <div className="hidden md:block">
              <span className="text-gray-400 text-sm border-l border-gray-600 pl-3">
                {currentRoomData.description}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            <span>{onlineCount} online</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected as {user?.username}</span>
            </div>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
