
import React, { useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { format } from 'date-fns';

const MessageList: React.FC = () => {
  const { messages, typingUsers, addReaction, user } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const reactions = ['👍', '❤️', '😄', '😮', '😢', '😡'];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="group">
          <div className="bg-blue-900/40 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{message.sender.username}</span>
              <span className="text-sm text-blue-200">
                {format(new Date(message.timestamp), 'dd/MM/yyyy, HH:mm:ss')}
              </span>
            </div>
            <div className="text-white mb-3">{message.content}</div>
            
            {/* Reactions */}
            <div className="flex items-center gap-1">
              {message.reactions && Object.entries(message.reactions).map(([emoji, userIds]) => (
                userIds.length > 0 && (
                  <button
                    key={emoji}
                    onClick={() => addReaction(message.id, emoji)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      userIds.includes(user?.id || '')
                        ? 'bg-blue-600/50 text-white border border-blue-400/30'
                        : 'bg-purple-600/30 text-purple-200 hover:bg-purple-600/50 border border-purple-400/20'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{userIds.length}</span>
                  </button>
                )
              ))}
              
              {/* Quick reaction buttons (visible on hover) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                {reactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(message.id, emoji)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-purple-600/30 rounded text-sm border border-purple-400/20"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-blue-200 text-sm bg-blue-900/20 backdrop-blur-sm rounded-xl p-3 border border-blue-400/20">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing`
              : `${typingUsers.length} people are typing`}
          </span>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
