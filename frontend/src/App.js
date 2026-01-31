import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import api from './services/api';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';

// Protected Route Component
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user data passed from AuthCallback, skip auth check
    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, location.state]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#002a4d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-[#f39200] rounded-full animate-spin"></div>
          <p className="text-white font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return React.cloneElement(children, { user, setUser });
}

// Main App Router
function AppRouter() {
  const location = useLocation();

  // CRITICAL: Check URL fragment for session_id synchronously during render
  // This prevents race conditions with ProtectedRoute
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return <AppRouter />;
}

export default App;
