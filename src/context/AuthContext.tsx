import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

const API = (import.meta as any).env?.VITE_API_URL || "";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (token) {
        await refreshUser();
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        // Only log out if token is invalid
        logout();
        return;
      }

      if (!res.ok) {
        console.warn('Profile fetch failed but keeping token', res.status, await res.text());
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        console.warn('Profile fetch returned success false, keeping token', data);
      }
    } catch (err) {
      console.error('refreshUser network error, keeping token', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};