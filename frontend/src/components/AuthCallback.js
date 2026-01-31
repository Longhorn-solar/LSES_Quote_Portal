import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (!sessionIdMatch) {
          console.error('No session_id found in URL');
          navigate('/login');
          return;
        }

        const sessionId = sessionIdMatch[1];

        // Exchange session_id for session_token
        const userData = await api.exchangeSession(sessionId);

        // Navigate to dashboard with user data
        navigate('/', { state: { user: userData }, replace: true });
      } catch (error) {
        console.error('Auth error:', error);
        // Show error message for unauthorized emails
        if (error.message.includes('not authorized')) {
          alert('Access denied. Your email is not authorized to use this application.');
        }
        navigate('/login');
      }
    };

    processAuth();
  }, [navigate, location.hash]);

  return (
    <div className="min-h-screen bg-[#002a4d] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white border-t-[#f39200] rounded-full animate-spin"></div>
        <p className="text-white font-semibold">Authenticating...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
