import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

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

  const refreshUser = async () => {
    if (!token) {
      console.log("[AuthContext] refreshUser - No token, skipping refresh");
      setIsLoading(false);
      return;
    }
    try {
      console.log("[AuthContext] refreshUser - Fetching profile with token:", token.substring(0, 10) + "...");
      const response = await fetch('/api/admin/profile', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log("[AuthContext] refreshUser - Response status:", response.status);
      
      if (response.status === 405) {
        console.error("[AuthContext] refreshUser - RECEIVED 405 METHOD NOT ALLOWED. This is unexpected for a GET request.");
      }

      const text = await response.text();
      console.log("[AuthContext] refreshUser - Response body (first 100 chars):", text.substring(0, 100));
      
      if (!response.ok) {
        console.warn("[AuthContext] refreshUser - Response not OK, logging out. Status:", response.status);
        logout();
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("[AuthContext] refreshUser - Failed to parse JSON:", e);
        logout();
        return;
      }

      if (data.success) {
        console.log("[AuthContext] refreshUser - Success for:", data.user.email);
        setUser(data.user);
      } else {
        console.warn("[AuthContext] refreshUser - API returned success:false:", data.error);
        logout();
      }
    } catch (error) {
      console.error('[AuthContext] refreshUser - Network or other error:', error);
      // Don't logout on network error, maybe it's temporary
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
