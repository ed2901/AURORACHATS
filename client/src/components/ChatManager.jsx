import { useState, useEffect } from 'react';
import { chatAPI, userAPI } from '../api.js';
import './ChatManager.css';

export default function ChatManager({ instanceId }) {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [instanceId]);

  const loadData = async () => {
    try {
      const [chatsRes, usersRes] = await Promise.all([
        chatAPI.getInstanceChats(instanceId),
        userAPI.getByInstance(instanceId),
      ]);
      setChats(chatsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (chatId, newAgentId) => {
    try {
      await chatAPI.reassign(chatId, newAgentId);
      loadData();
    } catch (error) {
      console.error('Error reassigning chat:', error);
    }
  };

  const handleCloseChat = async (chatId) => {
    try {
      await chatAPI.close(chatId);
      loadData();
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const agents = users.filter((u) => u.role === 'agent');

  return (
    <div className="chat-manager">
      <h2>Chat Management</h2>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : chats.length === 0 ? (
        <p>No chats</p>
      ) : (
        <div className="chats-grid">
          {chats.map((chat) => (
            <div key={chat.id} className="chat-card">
              <div className="chat-card-header">
                <h4>{chat.name || chat.phone_number}</h4>
                <span className={`status ${chat.status}`}>{chat.status}</span>
              </div>

              <div className="chat-card-body">
                <p>
                  <strong>NIU:</strong> {chat.niu || 'N/A'}
                </p>
                <p>
                  <strong>Reference:</strong> {chat.reference || 'N/A'}
                </p>
                <p>
                  <strong>Agent:</strong> {chat.agent_name || 'Unassigned'}
                </p>
              </div>

              <div className="chat-card-actions">
                {agents.length > 0 && (
                  <select
                    onChange={(e) => handleReassign(chat.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Reassign to...</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name}
                      </option>
                    ))}
                  </select>
                )}

                {chat.status === 'open' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCloseChat(chat.id)}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
