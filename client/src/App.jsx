import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AgentDashboard from './pages/AgentDashboard.jsx';
import './App.css';

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/agent"
          element={user && user.role === 'agent' ? <AgentDashboard /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
