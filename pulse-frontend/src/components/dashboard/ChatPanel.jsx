import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import clsx from 'clsx';

function ChatMessage({ message, isOwn }) {
  return (
    <div className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[80%] rounded-lg px-4 py-2',
          isOwn ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
        )}
      >
        {!isOwn && (
          <p className="text-xs font-medium text-gray-400 mb-1">{message.sender.name}</p>
        )}
        <p className="text-sm">{message.content}</p>
        <p className={clsx('text-xs mt-1', isOwn ? 'text-blue-200' : 'text-gray-400')}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function ChatPanel() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('dispatch');
  const messagesEndRef = useRef(null);

  // Mock messages
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        content: 'A-12 en route to cardiac emergency at 123 Main St',
        sender: { id: 1, name: 'Dispatch Central' },
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 2,
        content: 'Copy that. ETA 6 minutes.',
        sender: { id: 2, name: 'Paramedic Unit A-12' },
        timestamp: new Date(Date.now() - 240000).toISOString(),
      },
      {
        id: 3,
        content: 'City General confirmed ready for incoming. ICU on standby.',
        sender: { id: 3, name: 'Hospital Coordinator' },
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
      {
        id: 4,
        content: 'On scene. Patient is responsive. Vitals stabilizing.',
        sender: { id: 2, name: 'Paramedic Unit A-12' },
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
    ];
    setMessages(mockMessages);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      content: newMessage,
      sender: { id: user?.id || 0, name: user?.name || 'You' },
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const channels = [
    { id: 'dispatch', label: 'Dispatch', unread: 0 },
    { id: 'emergency-1', label: 'Emergency #1234', unread: 2 },
    { id: 'hospital', label: 'Hospital', unread: 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Channel Selector */}
      <div className="flex gap-1 p-2 border-b border-gray-700 overflow-x-auto scrollbar-thin">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setSelectedChannel(channel.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              selectedChannel === channel.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            )}
          >
            {channel.label}
            {channel.unread > 0 && (
              <span className="w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {channel.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwn={message.sender.id === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1"
            aria-label="Message input"
          />
          <button
            type="submit"
            className="btn-primary px-4"
            disabled={!newMessage.trim()}
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPanel;
