import { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCachedUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(Boolean(authService.getToken()));
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // Verify token on mount
  // ----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    if (!authService.getToken()) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const me = await authService.me();
        if (!cancelled) {
          setUser(me);
          setToken(authService.getToken());
        }
      } catch {
        if (!cancelled) {
          authService.clearLocal();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ----------------------------------------------------------
  // Global 401 handler — auto-logout on token rejection
  // ----------------------------------------------------------
  useEffect(() => {
    const handler = () => {
      setUser(null);
      setToken(null);
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        navigate('/admin/login', { replace: true });
      } else if (path !== '/' && path !== '/login' && path !== '/register') {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('vn:unauthorized', handler);
    return () => window.removeEventListener('vn:unauthorized', handler);
  }, [navigate]);

  // ----------------------------------------------------------
  // Auth actions
  // ----------------------------------------------------------
  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setToken(data.access_token);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const created = await authService.register(payload);
    return created;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await authService.me();
    setUser(me);
    return me;
  }, []);

  // ----------------------------------------------------------
  // Context value — every flag the app needs
  // ----------------------------------------------------------
  const value = {
    // state
    user,
    token,
    loading,

    // role flags
    isAuthenticated: Boolean(user),
    isCitizen: user?.role === 'CITIZEN',
    isAuthority: user?.role === 'AUTHORITY',
    isAdmin: user?.role === 'ADMIN',
    canAccessAdmin: user?.role === 'AUTHORITY' || user?.role === 'ADMIN',

    // actions
    login,
    register,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}