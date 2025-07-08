
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSocket } from '@/contexts/SocketContext';
import { User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useSocket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const newUser = {
        id: Date.now().toString(),
        username: username.trim(),
        isOnline: true,
      };
      setUser(newUser);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-blue-800/95 backdrop-blur-xl border border-purple-400/30">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-xl">
            <User className="w-6 h-6" />
            Join the Chat
          </DialogTitle>
          <DialogDescription className="text-blue-200">
            Enter your username to start chatting with others
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/10 backdrop-blur-sm border border-purple-400/30 text-white placeholder-blue-200 rounded-xl h-12"
            maxLength={20}
            autoFocus
          />
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 font-medium"
            disabled={!username.trim() || isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Chat'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
