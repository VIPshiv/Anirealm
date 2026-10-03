'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
}

export interface Profile {
  _id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  pin?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  currentProfile: Profile | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  register: (token: string, user: User) => void;
  selectProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedProfile = localStorage.getItem('currentProfile');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedProfile) {
        setCurrentProfile(JSON.parse(storedProfile));
      }
      // Optimistic loading: assume token is valid to render UI immediately.
      // fetchUser will verify in background and logout if invalid.
      setLoading(false); 
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch('/api/auth/user', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    router.push('/profile'); // Redirect to profile selection after login
  };

  const register = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    router.push('/profile'); // Redirect to profile selection after register
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentProfile');
    setToken(null);
    setUser(null);
    setCurrentProfile(null);
    router.push('/login');
  };

  const selectProfile = (profile: Profile) => {
    localStorage.setItem('currentProfile', JSON.stringify(profile));
    setCurrentProfile(profile);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, currentProfile, loading, login, logout, register, selectProfile }}>
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
