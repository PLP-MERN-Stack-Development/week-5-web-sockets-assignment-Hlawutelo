
import React from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';
import { Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RoomList: React.FC = () => {
  const { onlineUsers, user, setUser } = useSocket();

  const handleLeave = () => {
    setUser(null);
  };

  return (
    <div className="w-64 bg-purple-700/30 backdrop-blur-sm border-r border-purple-400/20 flex flex-col">
      <div className="p-6 border-b border-purple-400/20">
        <h2 className="text-white font-bold text-2xl">NODE</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-4">Users:</h3>
          <div className="space-y-2">
            {onlineUsers
              .filter(u => u.isOnline)
              .map((onlineUser) => (
                <div
                  key={onlineUser.id}
                  className={cn(
                    "text-white hover:text-blue-200 cursor-pointer transition-colors",
                    onlineUser.id === user?.id ? "text-blue-300 font-medium" : ""
                  )}
                >
                  {onlineUser.username}
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-purple-400/20">
        <Button
          onClick={handleLeave}
          className="w-full bg-purple-600/50 hover:bg-purple-600/70 text-white border border-purple-400/30"
          variant="outline"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Leave
        </Button>
      </div>
    </div>
  );
};

export default RoomList;
