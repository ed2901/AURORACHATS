import { useState, useEffect } from 'react';
import { useAuthStore, useInstanceStore } from '../store.js';
import { instanceAPI, userAPI } from '../api.js';
import CreateInstance from '../components/CreateInstance.jsx';
import ManageUsers from '../components/ManageUsers.jsx';
import ChatManager from '../components/ChatManager.jsx';
import QRModal from '../components/QRModal.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const instances = useInstanceStore((state) => state.instances);
  const setInstances = useInstanceStore((state) => state.setInstances);
  const currentInstance = useInstanceStore((state) => state.currentInstance);
  const setCurrentInstance = useInstanceStore((state) => state.setCurrentInstance);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingInstance, setEditingInstance] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInstanceId, setQrInstanceId] = useState(null);

  useEffect(() => {
    loadInstances();
    loadStats();
  }, []);

  const loadInstances = async () => {
    try {
      const response = await instanceAPI.getAll();
      setInstances(response.data);
      if (response.data.length > 0 && !currentInstance) {
        setCurrentInstance(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading instances:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await userAPI.getAll();
      setTotalUsers(res.data.length);
    } catch (e) {}
  };

  const handleEditInstance = (instance) => {
    setEditingInstance(instance.id);
    setEditName(instance.name);
    setEditPhone(instance.phone_number);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editPhone.trim()) return;
    try {
      await instanceAPI.update(editingInstance, { name: editName, phoneNumber: editPhone });
      setEditingInstance(null);
      loadInstances();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const handleDeleteInstance = async (instanceId) => {
    if (window.confirm('¿Eliminar esta instancia?')) {
      try {
        await instanceAPI.delete(instanceId);
        loadInstances();
        if (currentInstance?.id === instanceId) setCurrentInstance(null);
      } catch (error) {
        console.error('Error deleting instance:', error);
      }
    }
  };

  const handleGetQR = (instanceId) => {
    setQrInstanceId(instanceId);
    setShowQRModal(true);
  };

  const activeInstances = instances.filter(i => i.is_active).length;

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-logo-section">
          <img src="https://i.ibb.co/j9MCP7CV/AURORA-LOGO.png" alt="Aurora Logo" className="nav-logo-img" />
        </div>
        <button className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          🏠 Dashboard
        </button>
        <button className={`nav-btn ${activeTab === 'instances' ? 'active' : ''}`} onClick={() => setActiveTab('instances')}>
          📱 Instances
        </button>
        {user?.role !== 'agent' && (
          <>
            <button className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              👥 Users
            </button>
            <button className={`nav-btn ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}>
              💬 Chats
            </button>
          </>
        )}
      </nav>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Aurora Chat</h1>
            <p>WhatsApp Management System</p>
          </div>
          <div className="header-right">
            <span className="role-badge">{user?.role.toUpperCase()}</span>
            <span className="user-name">{user?.fullName}</span>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </header>

        <div className="dashboard-main">
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <>
              {activeTab === 'home' && (
                <div>
                  <h2>Bienvenido, {user?.fullName}</h2>
                  <p>Panel de control de Aurora Chat</p>
                  <div className="stats-grid">
                    <div className="stat-card" onClick={() => setActiveTab('instances')}>
                      <div className="stat-icon">📱</div>
                      <div className="stat-info">
                        <h3>{instances.length}</h3>
                        <p>Instancias</p>
                      </div>
                    </div>
                    <div className="stat-card" onClick={() => setActiveTab('instances')}>
                      <div className="stat-icon">🟢</div>
                      <div className="stat-info">
                        <h3>{activeInstances}</h3>
                        <p>Conectadas</p>
                      </div>
                    </div>
                    {user?.role !== 'agent' && (
                      <div className="stat-card" onClick={() => setActiveTab('users')}>
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                          <h3>{totalUsers}</h3>
                          <p>Usuarios</p>
                        </div>
                      </div>
                    )}
                    <div className="stat-card" onClick={() => setActiveTab('chats')}>
                      <div className="stat-icon">💬</div>
                      <div className="stat-info">
                        <h3>Chats</h3>
                        <p>Ver conversaciones</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'instances' && (
                <div>
                  {user?.role === 'admin' && <CreateInstance onCreated={loadInstances} />}
                  <div className="instances-grid">
                    {instances.map((instance) => (
                      <div key={instance.id} className={`instance-card ${currentInstance?.id === instance.id ? 'active' : ''}`}>
                        {editingInstance === instance.id ? (
                          <div className="instance-edit-form">
                            <h4>Edit Instance</h4>
                            <div className="form-group">
                              <label>Name</label>
                              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Phone Number</label>
                              <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                            </div>
                            <div className="edit-buttons">
                              <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
                              <button className="btn btn-secondary" onClick={() => setEditingInstance(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div onClick={() => setCurrentInstance(instance)}>
                              <h3>{instance.name}</h3>
                              <p>{instance.phone_number}</p>
                              <div className={`status ${instance.is_active ? 'active' : 'inactive'}`}>
                                {instance.is_active ? '🟢 Active' : '🔴 Inactive'}
                              </div>
                            </div>
                            {user?.role === 'admin' && (
                              <div className="instance-actions">
                                <button className="btn btn-secondary" onClick={() => handleEditInstance(instance)}>Edit</button>
                                <button className="btn btn-primary" onClick={() => handleGetQR(instance.id)}>Get QR</button>
                                <button className="btn btn-success" onClick={() => { setCurrentInstance(instance); setActiveTab('chats'); }}>💬 Chats</button>
                                <button className="btn btn-danger" onClick={() => handleDeleteInstance(instance.id)}>Delete</button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'users' && <ManageUsers instanceId={currentInstance?.id} />}
              {activeTab === 'chats' && currentInstance && <ChatManager instanceId={currentInstance.id} />}
            </>
          )}
        </div>

        {qrInstanceId && (
          <QRModal
            instanceId={qrInstanceId}
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            onConnected={() => { setShowQRModal(false); loadInstances(); }}
          />
        )}

        <footer className="dashboard-footer">
          <p>&copy; 2024 Aurora Chat. Developed by Marvin Rodriguez & Rogelio Valiente</p>
        </footer>
      </div>
    </div>
  );
}
