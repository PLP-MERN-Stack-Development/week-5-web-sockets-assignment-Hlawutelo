
import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatRoom: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col bg-transparent">
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default ChatRoom;
