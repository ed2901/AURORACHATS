import { useState, useEffect } from 'react';
import { useAuthStore, useInstanceStore } from '../store.js';
import { instanceAPI, userAPI } from '../api.js';
import CreateInstance from '../components/CreateInstance.jsx';
import ManageUsers from '../components/ManageUsers.jsx';
import ChatManager from '../components/ChatManager.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const instances = useInstanceStore((state) => state.instances);
  const setInstances = useInstanceStore((state) => state.setInstances);
  const currentInstance = useInstanceStore((state) => state.currentInstance);
  const setCurrentInstance = useInstanceStore((state) => state.setCurrentInstance);
  const [activeTab, setActiveTab] = useState('instances');
  const [loading, setLoading] = useState(true);
  const [editingInstance, setEditingInstance] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    loadInstances();
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

  const handleEditInstance = (instance) => {
    setEditingInstance(instance.id);
    setEditName(instance.name);
    setEditPhone(instance.phone_number);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await instanceAPI.update(editingInstance, {
        name: editName,
        phoneNumber: editPhone,
      });
      setEditingInstance(null);
      setEditName('');
      setEditPhone('');
      loadInstances();
    } catch (error) {
      console.error('Error updating instance:', error);
      alert('Error updating instance: ' + error.response?.data?.error);
    }
  };

  const handleDeleteInstance = async (instanceId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta instancia? Se eliminarán todos los chats y clientes asociados.')) {
      try {
        await instanceAPI.delete(instanceId);
        loadInstances();
        if (currentInstance?.id === instanceId) {
          setCurrentInstance(null);
        }
      } catch (error) {
        console.error('Error deleting instance:', error);
      }
    }
  };

  const handleReconnectInstance = async (instanceId) => {
    try {
      await instanceAPI.reconnect(instanceId);
      loadInstances();
    } catch (error) {
      console.error('Error reconnecting instance:', error);
      alert('Error reconnecting instance: ' + error.response?.data?.error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>AURORA CHAT</h1>
          <span className="role-badge">{user?.role.toUpperCase()}</span>
        </div>
        <div className="header-right">
          <span>{user?.fullName}</span>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button
            className={`nav-btn ${activeTab === 'instances' ? 'active' : ''}`}
            onClick={() => setActiveTab('instances')}
          >
            Instances
          </button>
          {user?.role !== 'agent' && (
            <>
              <button
                className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
              <button
                className={`nav-btn ${activeTab === 'chats' ? 'active' : ''}`}
                onClick={() => setActiveTab('chats')}
              >
                Chats
              </button>
            </>
          )}
        </nav>

        <div className="dashboard-main">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {activeTab === 'instances' && (
                <div>
                  {user?.role === 'admin' && <CreateInstance onCreated={loadInstances} />}
                  <div className="instances-grid">
                    {instances.map((instance) => (
                      <div
                        key={instance.id}
                        className={`instance-card ${currentInstance?.id === instance.id ? 'active' : ''}`}
                      >
                        {editingInstance === instance.id ? (
                          <div className="instance-edit-form">
                            <h4>Edit Instance</h4>
                            <div className="form-group">
                              <label>Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Instance name"
                              />
                            </div>
                            <div className="form-group">
                              <label>Phone Number</label>
                              <input
                                type="tel"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="Phone number"
                              />
                            </div>
                            <div className="edit-buttons">
                              <button className="btn btn-primary" onClick={handleSaveEdit}>
                                Save
                              </button>
                              <button className="btn btn-secondary" onClick={() => setEditingInstance(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div onClick={() => setCurrentInstance(instance)}>
                              <h3>{instance.name}</h3>
                              <p>{instance.phone_number}</p>
                              <div className={`status ${instance.is_active ? 'active' : 'inactive'}`}>
                                {instance.is_active ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                            {user?.role === 'admin' && (
                              <div className="instance-actions">
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => handleEditInstance(instance)}
                                >
                                  Edit
                                </button>
                                {!instance.is_active && (
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => handleReconnectInstance(instance.id)}
                                  >
                                    Reconnect
                                  </button>
                                )}
                                <button
                                  className="btn btn-danger"
                                  onClick={() => handleDeleteInstance(instance.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'users' && currentInstance && (
                <ManageUsers instanceId={currentInstance.id} />
              )}

              {activeTab === 'chats' && currentInstance && (
                <ChatManager instanceId={currentInstance.id} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

