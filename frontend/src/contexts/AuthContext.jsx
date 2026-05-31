import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 1 ngày

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('login_at');
}

function isSessionExpired() {
  const loginAt = localStorage.getItem('login_at');
  if (!loginAt) return true;
  return Date.now() - Number(loginAt) > SESSION_DURATION;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      if (isSessionExpired()) {
        clearSession();
        disconnectSocket();
        setLoading(false);
        return;
      }
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setLoading(false);
        connectSocket(token);

        // Verify token in the background. Render is not blocked by Render cold-start.
        api.get('/auth/me')
          .then(res => {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          })
          .catch(() => {
            clearSession();
            setUser(null);
            disconnectSocket();
          })
          .finally(() => {});
      } catch {
        clearSession();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('login_at', Date.now().toString());
    setUser(res.data.user);
    connectSocket(res.data.token);
    return res.data;
  };

  const register = async (email, password, full_name) => {
    const res = await api.post('/auth/register', { email, password, full_name });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('login_at', Date.now().toString());
    setUser(res.data.user);
    connectSocket(res.data.token);
    return res.data;
  };

  const logout = () => {
    clearSession();
    disconnectSocket();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
