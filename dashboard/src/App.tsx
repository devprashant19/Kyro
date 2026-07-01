import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import { SignInPage } from './pages/SignIn';
import { SignUpPage } from './pages/SignUp';
import DashboardLayout from './pages/DashboardLayout';
import AppLayout from './components/AppLayout';
import AppHome from './pages/AppHome';
import ExtensionPage from './pages/ExtensionPage';
import HowItWorksPage from './pages/HowItWorksPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  const { isLoaded, isSignedIn } = useClerkAuth();

  if (!isLoaded) return <div className="h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={isSignedIn ? <Navigate to="/app" /> : <LandingPage />} />
      <Route path="/sign-in/*" element={isSignedIn ? <Navigate to="/app" /> : <SignInPage />} />
      <Route path="/sign-up/*" element={isSignedIn ? <Navigate to="/app" /> : <SignUpPage />} />
      
      {/* Protected Routes */}
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
