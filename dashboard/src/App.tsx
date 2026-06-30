import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/app" /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/app" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/app" /> : <Register />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/app/*" element={<DashboardLayout />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
