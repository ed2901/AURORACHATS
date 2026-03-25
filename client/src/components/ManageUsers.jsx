import { useState, useEffect } from 'react';
import { userAPI } from '../api.js';
import './ManageUsers.css';

export default function ManageUsers({ instanceId }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [resetUserName, setResetUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    employeeCode: '',
    role: 'agent',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [instanceId]);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getByInstance(instanceId);
      setUsers(response.data);
    } catch (err) {
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUserId) {
        // Update user
        await userAPI.update(editingUserId, {
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
        });
        setEditingUserId(null);
      } else {
        // Create new user
        const response = await userAPI.create({
          ...formData,
          instanceId,
        });
        alert(`User created!\nTemp Password: ${response.data.tempPassword}`);
      }

      setFormData({ email: '', fullName: '', employeeCode: '', role: 'agent' });
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving user');
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      email: user.email,
      fullName: user.full_name,
      employeeCode: user.employee_code,
      role: user.role,
    });
    setShowForm(true);
  };

  const handleResetPasswordClick = (userId, userName) => {
    setResetUserId(userId);
    setResetUserName(userName);
    setNewPassword('');
    setShowResetModal(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      alert('Please enter a password');
      return;
    }

    try {
      const response = await userAPI.resetPasswordCustom(resetUserId, newPassword);
      alert(`Password reset successfully!\nNew Password: ${newPassword}`);
      setShowResetModal(false);
      setResetUserId(null);
      setResetUserName('');
      setNewPassword('');
      loadUsers();
    } catch (err) {
      alert('Error resetting password: ' + err.response?.data?.error);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Delete user ${userName}? This cannot be undone.`)) {
      try {
        await userAPI.delete(userId);
        loadUsers();
      } catch (err) {
        alert('Error deleting user: ' + err.response?.data?.error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUserId(null);
    setFormData({ email: '', fullName: '', employeeCode: '', role: 'agent' });
  };

  return (
    <div className="manage-users">
      <h2>Manage Users</h2>

      <button
        className="btn btn-primary"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Add User'}
      </button>

      {showForm && (
        <div className="user-form-card">
          <h3>{editingUserId ? 'Edit User' : 'Create New User'}</h3>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            {!editingUserId && (
              <div className="form-group">
                <label>Employee Code</label>
                <input
                  type="text"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="agent">Agent</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                {editingUserId ? 'Update User' : 'Create User'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password for {resetUserName}</h3>
              <button className="modal-close" onClick={() => setShowResetModal(false)}>×</button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="modal-body">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoFocus
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-table">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : users.length === 0 ? (
          <p>No users yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Employee Code</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.employee_code}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => handleEdit(user)}
                      title="Edit user"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-warning"
                      onClick={() => handleResetPasswordClick(user.id, user.full_name)}
                      title="Reset password"
                    >
                      Reset Pass
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(user.id, user.full_name)}
                      title="Delete user"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
