import React, { useRef } from 'react';

const MessageInput = ({ message, onChange, onSend, onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <form className="message-input-form" onSubmit={onSend}>
      <button 
        type="button" 
        className="attach-btn"
        onClick={() => fileInputRef.current.click()}
      >
        <span className="material-icons">attach_file</span>
      </button>
      
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      <input
        type="text"
        value={message}
        onChange={onChange}
        placeholder="Type a message..."
        className="message-input"
      />
      
      <button type="submit" className="send-btn">
        <span className="material-icons">send</span>
      </button>
    </form>
  );
};

export default MessageInput;