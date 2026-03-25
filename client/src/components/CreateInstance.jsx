import { useState } from 'react';
import { instanceAPI } from '../api.js';
import QRModal from './QRModal.jsx';
import './CreateInstance.css';

export default function CreateInstance({ onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdInstanceId, setCreatedInstanceId] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      const response = await instanceAPI.create({ phoneNumber, name });
      setCreatedInstanceId(response.data.id);
      setPhoneNumber('');
      setName('');
      setSuccess(true);
      setShowQRModal(true);
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating instance');
      setLoading(false);
    }
  };

  const handleQRModalClose = () => {
    setShowQRModal(false);
    onCreated();
  };

  const handleQRConnected = () => {
    setShowQRModal(false);
    onCreated();
  };

  return (
    <div className="create-instance">
      <button
        className="btn btn-primary"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Create Instance'}
      </button>

      {showForm && (
        <div className="instance-form-card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">✓ Instance created successfully!</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1234567890"
                required
              />
            </div>

            <div className="form-group">
              <label>Instance Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sales Team"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      )}

      {createdInstanceId && (
        <QRModal
          instanceId={createdInstanceId}
          isOpen={showQRModal}
          onClose={handleQRModalClose}
          onConnected={handleQRConnected}
        />
      )}
    </div>
  );
}
