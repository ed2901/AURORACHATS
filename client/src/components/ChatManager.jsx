import { useState, useEffect, useRef } from 'react';
import { chatAPI, userAPI, clientAPI } from '../api.js';
import './ChatManager.css';

export default function ChatManager({ instanceId }) {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [instanceId]);

  useEffect(() => {
    if (selectedChat) loadMessages(selectedChat.id);
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const loadMessages = async (chatId) => {
    try {
      const res = await chatAPI.getMessages(chatId);
      setMessages(res.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    try {
      await chatAPI.sendMessage(selectedChat.id, newMessage);
      setNewMessage('');
      loadMessages(selectedChat.id);
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const handleNewChat = async (e) => {
    e.preventDefault();
    try {
      const clientRes = await clientAPI.create({ instanceId, phoneNumber: newPhone, name: newName });
      await clientAPI.startChat(clientRes.data.id);
      setShowNewChat(false);
      setNewPhone('');
      setNewName('');
      loadData();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const handleCloseChat = async (chatId) => {
    try {
      await chatAPI.close(chatId);
      if (selectedChat?.id === chatId) setSelectedChat(null);
      loadData();
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-manager-layout">
      {/* Lista de chats */}
      <div className="chat-list-panel">
        <div className="chat-list-header">
          <h3>Chats</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewChat(!showNewChat)}>+</button>
        </div>

        {showNewChat && (
          <form onSubmit={handleNewChat} className="new-chat-form-inline">
            <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Teléfono (ej: 50312345678)" required />
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" />
            <button type="submit" className="btn btn-primary">Iniciar</button>
          </form>
        )}

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : chats.length === 0 ? (
          <p className="no-chats-msg">No hay chats aún</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-list-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="chat-list-avatar">{(chat.name || chat.phone_number || '?')[0].toUpperCase()}</div>
              <div className="chat-list-info">
                <span className="chat-list-name">{chat.name || chat.phone_number}</span>
                <span className="chat-list-phone">{chat.phone_number}</span>
              </div>
              <span className={`status-dot ${chat.status}`}></span>
            </div>
          ))
        )}
      </div>

      {/* Ventana de chat */}
      <div className="chat-window-panel">
        {selectedChat ? (
          <>
            <div className="chat-window-header">
              <div className="chat-window-avatar">{(selectedChat.name || selectedChat.phone_number || '?')[0].toUpperCase()}</div>
              <div className="chat-window-info">
                <span className="chat-window-name">{selectedChat.name || selectedChat.phone_number}</span>
                <span className="chat-window-phone">{selectedChat.phone_number}</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleCloseChat(selectedChat.id)}>Cerrar chat</button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <p className="no-messages-msg">No hay mensajes aún</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`message-bubble ${msg.sender_type === 'agent' ? 'sent' : 'received'}`}>
                    <p>{msg.content}</p>
                    <span className="message-time">{formatTime(msg.created_at)}</span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={selectedChat.status !== 'open'}
              />
              <button type="submit" className="btn btn-primary" disabled={selectedChat.status !== 'open'}>
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="chat-window-empty">
            <p>Selecciona un chat para ver la conversación</p>
          </div>
        )}
      </div>
    </div>
  );
}
