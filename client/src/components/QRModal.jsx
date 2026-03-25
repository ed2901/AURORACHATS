import { useState, useEffect } from 'react';
import { instanceAPI } from '../api.js';
import './QRModal.css';

export default function QRModal({ instanceId, isOpen, onClose, onConnected }) {
  const [qrCode, setQrCode] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !instanceId) return;

    setLoading(true);
    setError('');
    setQrCode(null);
    setIsConnected(false);

    const fetchQRCode = async () => {
      try {
        const response = await instanceAPI.getStatus(instanceId);
        if (response.data.qr) {
          setQrCode(response.data.qr);
        }
        if (response.data.connected) {
          setIsConnected(true);
          if (onConnected) onConnected();
        } else if (!response.data.qr) {
          // If no QR and not connected, try again after a delay
          setTimeout(fetchQRCode, 1000);
          return;
        }
      } catch (err) {
        setError('Error generating QR code: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [isOpen, instanceId]);

  // Poll for connection status
  useEffect(() => {
    if (!isOpen || !instanceId || isConnected) return;

    const pollStatus = async () => {
      try {
        const response = await instanceAPI.getStatus(instanceId);
        if (response.data.connected) {
          setIsConnected(true);
          if (onConnected) onConnected();
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    };

    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [isOpen, instanceId, isConnected, onConnected]);

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    setQrCode(null);

    try {
      const response = await instanceAPI.getStatus(instanceId);
      if (response.data.qr) {
        setQrCode(response.data.qr);
      }
      if (response.data.connected) {
        setIsConnected(true);
        if (onConnected) onConnected();
      }
    } catch (err) {
      setError('Error generating QR code: ' + err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQrCode(null);
    setIsConnected(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Connect WhatsApp</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          {isConnected ? (
            <div className="connection-success">
              <div className="success-icon">✓</div>
              <h3>Connected Successfully!</h3>
              <p>Your WhatsApp instance is now connected and ready to use.</p>
            </div>
          ) : (
            <div className="qr-container">
              <h3>Scan QR Code</h3>
              <p>Use your phone to scan this QR code with WhatsApp</p>
              
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Generating QR code...</p>
                </div>
              ) : qrCode ? (
                <div className="qr-display">
                  <img src={qrCode} alt="QR Code" className="qr-image" />
                  <p className="qr-hint">Point your phone camera at this QR code</p>
                </div>
              ) : (
                <div className="error-state">
                  <p>Failed to generate QR code</p>
                </div>
              )}

              <p className="connection-status">
                Waiting for scan...
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isConnected ? (
            <button className="btn btn-primary" onClick={handleClose}>
              Done
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh QR
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
