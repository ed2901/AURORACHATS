import { useState, useEffect } from 'react';
import { useAuthStore, useChatStore } from '../store.js';
import { chatAPI, clientAPI } from '../api.js';
import ChatWindow from '../components/ChatWindow.jsx';
import './AgentDashboard.css';

export default function AgentDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const chats = useChatStore((state) => state.chats);
  const currentChat = useChatStore((state) => state.currentChat);
  const setChats = useChatStore((state) => state.setChats);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [newChatNIU, setNewChatNIU] = useState('');
  const [newChatReference, setNewChatReference] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadChats = async () => {
    try {
      const response = await chatAPI.getMyChats();
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewChat = async (e) => {
    e.preventDefault();
    try {
      const clientResponse = await clientAPI.create({
        instanceId: user.instanceId,
        phoneNumber: newChatPhone,
      });

      const chatResponse = await clientAPI.startChat(clientResponse.data.id);
      setChats([...chats, chatResponse.data]);
      setCurrentChat(chatResponse.data);
      setShowNewChat(false);
      setNewChatPhone('');
      setNewChatMessage('');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className="agent-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>AURORA CHAT - My Chats</h1>
        </div>
        <div className="header-right">
          <span>{user?.fullName}</span>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="agent-content">
        <div className="chats-list">
          <button
            className="btn btn-primary"
            onClick={() => setShowNewChat(!showNewChat)}
            style={{ width: '100%', marginBottom: '15px' }}
          >
            {showNewChat ? 'Cancel' : 'New Chat'}
          </button>

          {showNewChat && (
            <form onSubmit={handleStartNewChat} className="new-chat-form">
              <div className="form-group">
                <label>Client Phone</label>
                <input
                  type="tel"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  placeholder="1234567890"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Start Chat
              </button>
            </form>
          )}

          <div className="chats-container">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : chats.length === 0 ? (
              <p className="no-chats">No chats yet</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => setCurrentChat(chat)}
                >
                  <div className="chat-info">
                    <h4>{chat.name || chat.phone_number}</h4>
                    <p>{chat.niu && `NIU: ${chat.niu}`}</p>
                    <p className="reference">{chat.reference}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-window-container">
          {currentChat ? (
            <ChatWindow chat={currentChat} onChatUpdated={loadChats} />
          ) : (
            <div className="no-chat-selected">
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
