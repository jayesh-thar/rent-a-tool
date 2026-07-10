import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api, { setupInterceptors } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use refs so the Axios interceptor always reads the latest token
  // without needing to re-register interceptors on every state change.
  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  // Refresh the access token — called by the Axios interceptor on 401.
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await api.post('/auth/refresh');
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      return res.data.accessToken;
    } catch {
      setAccessToken(null);
      setUser(null);
      throw new Error('Session expired');
    }
  }, []);

  // Wire the Axios interceptors once on mount.
  useEffect(() => {
    setupInterceptors(
      () => accessTokenRef.current,
      refreshAccessToken
    );
  }, [refreshAccessToken]);

  // On app load, try to restore the session using the refresh token cookie.
  // If the cookie is valid, we get a new access token without the user re-logging in.
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await api.post('/auth/refresh');
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      } catch {
        // No valid session — user needs to log in. This is expected, not an error.
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (fullName, email, password, phoneNumber, userType, communityDetails) => {
    const res = await api.post('/auth/register', { fullName, email, password, phoneNumber, userType, communityDetails });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the server call fails, clear local state.
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, login, register, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
