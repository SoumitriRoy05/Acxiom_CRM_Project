import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('acxiom_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth-logout', handleAuthLogout);

    const checkAuth = async () => {
      const token = localStorage.getItem('acxiom_token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          localStorage.setItem('acxiom_user', JSON.stringify(userData));
        } catch (err) {
          localStorage.removeItem('acxiom_token');
          localStorage.removeItem('acxiom_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('acxiom_token', res.token);
    const userInfo = {
      id: res.userId,
      name: res.name,
      email: res.email,
      role: res.role,
    };
    localStorage.setItem('acxiom_user', JSON.stringify(userInfo));
    setUser(userInfo);
    return res;
  };

  const register = async (name, email, password, role) => {
    const res = await api.register({ name, email, password, role });
    localStorage.setItem('acxiom_token', res.token);
    const userInfo = {
      id: res.userId,
      name: res.name,
      email: res.email,
      role: res.role,
    };
    localStorage.setItem('acxiom_user', JSON.stringify(userInfo));
    setUser(userInfo);
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('acxiom_token');
      localStorage.removeItem('acxiom_user');
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isSales = user?.role === 'SALES_EXECUTIVE';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isManager, isSales }}>
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
