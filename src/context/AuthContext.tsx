import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { phone?: string; username?: string }) => Promise<void>;
  register: (data: { username: string; phone: string; email?: string; freeFireName: string; freeFireUid: string }) => Promise<void>;
  loginWithGoogle: (data: { credential?: string; code?: string; redirectUri?: string; email?: string; name?: string; avatar?: string; googleId?: string; freeFireName?: string; freeFireUid?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { freeFireName?: string; freeFireUid?: string; email?: string; phone?: string }) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'ff_esports_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const refreshUser = async () => {
    const savedUserId = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (savedUserId) {
      try {
        const userData = await api.getUser(savedUserId);
        setUser(userData);
      } catch {
        // Saved user id is not in current database session, clean up stale session key
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { phone?: string; username?: string }) => {
    const res = await api.login(credentials);
    setUser(res.user);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, res.user.id);
    setIsAuthModalOpen(false);
  };

  const register = async (data: { username: string; phone: string; email?: string; freeFireName: string; freeFireUid: string }) => {
    const res = await api.register(data);
    setUser(res.user);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, res.user.id);
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async (data: { credential?: string; email?: string; name?: string; avatar?: string; googleId?: string; freeFireName?: string; freeFireUid?: string }) => {
    const res = await api.loginWithGoogle(data);
    setUser(res.user);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, res.user.id);
    setIsAuthModalOpen(false);
  };

  const updateProfile = async (data: { freeFireName?: string; freeFireUid?: string; email?: string; phone?: string }) => {
    if (!user) return;
    const res = await api.updateProfile(user.id, data);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
        updateProfile,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
