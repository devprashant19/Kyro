import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import AppLayout from './components/AppLayout';
import AppHome from './pages/AppHome';
import ExtensionPage from './pages/ExtensionPage';
import HowItWorksPage from './pages/HowItWorksPage';
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
        <Route element={<AppLayout />}>
          <Route path="/app" element={<AppHome />} />
          <Route path="/app/dashboard/*" element={<DashboardLayout />} />
          <Route path="/app/extension" element={<ExtensionPage />} />
          <Route path="/app/how-it-works" element={<HowItWorksPage />} />
          <Route path="/app/settings" element={<Navigate to="/app/dashboard" replace />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
