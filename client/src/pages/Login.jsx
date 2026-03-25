import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store.js';
import { authAPI } from '../api.js';
import './Login.css';

export default function Login() {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For now, we'll use employeeCode as email (backend can be updated later)
      const response = await authAPI.login(employeeCode, password);
      setAuth(response.data.user, response.data.token);
      navigate(response.data.user.role === 'agent' ? '/agent' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img 
            src="https://i.ibb.co/j9MCP7CV/AURORA-LOGO.png" 
            alt="Aurora Chat Logo" 
            className="logo-image"
          />
          <h1>AURORA CHAT</h1>
          <p>Multi-user WhatsApp Management System</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código de Empleado</label>
            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
              placeholder="Ingrese su código"
              pattern="[A-Z]{2}[0-9]{6}"
              title="Formato: 2 letras + 6 números"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          <p>Developed by <strong>Marvin Rodriguez</strong> & <strong>Rogelio Valiente</strong></p>
        </div>
      </div>
    </div>
  );
}
