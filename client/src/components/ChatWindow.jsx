import { useState, useEffect } from 'react';
import { useChatStore } from '../store.js';
import { chatAPI } from '../api.js';
import './ChatWindow.css';

export default function ChatWindow({ chat, onChatUpdated }) {
  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [chat.id]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(chat.id);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    setError('');

    try {
      await chatAPI.sendMessage(chat.id, messageText);
      setMessageText('');
      await loadMessages();
    } catch (error) {
      setError(error.response?.data?.error || 'Error sending message');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div>
          <h3>{chat.name || chat.phone_number}</h3>
          <p>{chat.niu && `NIU: ${chat.niu}`} | {chat.reference}</p>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start chatting!</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender_type === 'agent' ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                {msg.is_flagged && <span className="flag-badge">⚠️ Flagged</span>}
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        {error && <div className="error-message">{error}</div>}
        <div className="input-group">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            maxLength={1000}
          />
          <button type="submit" disabled={sending || !messageText.trim()}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
