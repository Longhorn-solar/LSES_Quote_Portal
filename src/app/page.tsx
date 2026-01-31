'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authProcessing, setAuthProcessing] = useState(false);

  useEffect(() => {
    // Check for session_id in URL hash (OAuth callback)
    const hash = window.location.hash;
    if (hash.includes('session_id=')) {
      setAuthProcessing(true);
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        // Exchange session_id for session
        fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        })
          .then(res => {
            if (!res.ok) throw new Error('Auth failed');
            return res.json();
          })
          .then(userData => {
            setUser(userData);
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
          })
          .catch(err => {
            console.error('Auth error:', err);
            alert('Access denied. Your email is not authorized.');
          })
          .finally(() => {
            setAuthProcessing(false);
            setIsLoading(false);
          });
        return;
      }
    }

    // Check existing session
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(userData => setUser(userData))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || authProcessing) {
    return (
      <div className="min-h-screen bg-[#002a4d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-[#f39200] rounded-full animate-spin"></div>
          <p className="text-white font-semibold">
            {authProcessing ? 'Authenticating...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Dashboard user={user} setUser={setUser} />;
}
