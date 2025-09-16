import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock backend URL - in production, this would be your deployed backend
const API_BASE = 'https://your-backend.herokuapp.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('token');
    if (token) {
      // In production, verify token with backend
      // For demo, we'll use mock user data
      setUser({
        id: '1',
        username: 'demo_user',
        email: 'demo@contractiq.com'
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication - in production, call your backend
    if (email === 'demo@contractiq.com' && password === 'demo123') {
      const mockUser = {
        id: '1',
        username: 'Demo User',
        email: 'demo@contractiq.com'
      };
      const mockToken = 'demo-jwt-token';
      
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    // Mock signup - in production, call your backend
    const mockUser = {
      id: '1',
      username,
      email
    };
    const mockToken = 'demo-jwt-token';
    
    localStorage.setItem('token', mockToken);
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}