import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// This page handles the redirect from the backend after a successful Google OAuth login.
// The backend redirects here with the access token in the URL. We read it, restore the
// full session (by fetching /auth/me), clear the URL, and redirect to the dashboard.
function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAccessToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleToken() {
      const token = searchParams.get('token');
      if (!token) {
        setError('No authentication token received');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        // The refresh token cookie was already set by the backend.
        // Call refresh to sync the auth context with the new session.
        await refreshAccessToken();
        navigate('/dashboard', { replace: true });
      } catch {
        setError('Failed to establish session. Please try logging in again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    }
    handleToken();
  }, [searchParams, navigate, refreshAccessToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="text-center">
        {error ? (
          <div className="space-y-3">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
              {error}
            </div>
            <p className="text-slate-500 text-xs">Redirecting to login…</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-500 border-t-amber-400 rounded-full animate-spin" />
            <span>Completing sign-in…</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleSuccess;
