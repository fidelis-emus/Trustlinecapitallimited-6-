import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

// Define the API base URL from .env
const API = import.meta.env.VITE_API_URL;

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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch the current admin profile from the backend
  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Save token and user to state and localStorage
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  // Clear token and user
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};